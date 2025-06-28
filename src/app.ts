import Koa from 'koa';
import helmet from 'koa-helmet';
import logger from 'koa-logger';
import { get, isNil } from 'lodash';
import { environmentManager, getCorsConfig, corsMiddleware } from './config';
import { PluginManager } from './plugins/PluginManager';

export class App {
  private app: Koa;
  private pluginManager: PluginManager;
  private server: any;

  constructor() {
    this.app = new Koa();
    this.pluginManager = new PluginManager();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(logger());

    const config = environmentManager.loadConfig();
    const corsConfig = getCorsConfig(config);
    this.app.use(corsMiddleware(corsConfig));

    this.app.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;

      const logLevel =
        ctx.status >= 400 ? 'error' : ctx.status >= 300 ? 'warn' : 'info';
      const log = {
        timestamp: new Date().toISOString(),
        level: logLevel,
        method: ctx.method,
        url: ctx.url,
        status: ctx.status,
        responseTime: `${ms}ms`,
        clientIP: ctx.request.ip,
        userAgent: ctx.get('User-Agent'),
        requestId: get(ctx.get('X-Request-ID'), 'none'),
      };

      console.log(JSON.stringify(log));
    });

    this.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err: any) {
        ctx.status = get(err, 'status', 500);
        ctx.body = {
          error: get(err, 'message', 'Internal Server Error'),
          timestamp: new Date().toISOString(),
        };
        ctx.app.emit('error', err, ctx);
      }
    });
  }

  private setupRoutes(): void {
    this.app.use(async (ctx, next) => {
      if (ctx.path === '/health') {
        const clientIP = get(ctx.request, 'ip', 'unknown');

        ctx.status = 200;
        ctx.body = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          clientIP: clientIP.split(',')[0].trim(),
          userAgent: get(ctx.get('User-Agent'), 'unknown'),
          requestId: get(ctx.get('X-Request-ID'), 'none'),
        };
        return;
      }
      await next();
    });

    this.pluginManager.registerRoutes(this.app);
  }

  async start(): Promise<void> {
    const config = environmentManager.loadConfig();

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(config.port, () => {
          console.log(`🚀 Server running on port ${config.port}`);
          console.log(`📊 Environment: ${config.nodeEnv}`);
          console.log(`🌍 Region: ${config.region}`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          console.error('❌ Server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise(resolve => {
      if (!isNil(this.server)) {
        this.server.close(() => {
          console.log('✅ Server stopped gracefully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getApp(): Koa {
    return this.app;
  }

  getServer(): any {
    return this.server;
  }
}
