import Koa from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { PluginContext, GatewayPlugin, Route } from './GatewayCoreTypes';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const USE_BUFFER_MODE = false; // Set to true to debug with buffering instead of streaming

/**
 * Checks if a request path matches a route path.
 * Extend this for wildcards/regex in the future.
 */
function matchPath(requestPath: string, routePath: string): boolean {
  return requestPath === routePath;
}

export class GatewayCoreService {
  private plugins: Map<string, GatewayPlugin> = new Map();
  private routes: Route[] = [];

  constructor(plugins: GatewayPlugin[], routes: Route[]) {
    for (const plugin of plugins) {
      this.plugins.set(plugin.name, plugin);
    }
    // Sort routes by priority descending (default 0)
    this.routes = [...routes].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Finds the first route that matches the incoming request.
   */
  private findMatchingRoute(ctx: Koa.Context): Route | null {
    for (const route of this.routes) {
      if (route.methods && !route.methods.includes(ctx.method)) {
        continue;
      }
      if (route.paths && !route.paths.some(p => matchPath(ctx.path, p))) {
        continue;
      }
      // Extend here for host, header, query, regex matching
      return route;
    }
    return null;
  }

  /**
   * Main entry point for processing a request through plugins and proxy.
   */
  async processRequest(ctx: Koa.Context): Promise<void> {
    const requestId = uuidv4();
    const startTime = Date.now();
    const pluginCtx: PluginContext = {
      requestId,
      startTime,
      metadata: new Map(),
      metrics: {},
    };

    try {
      const route = this.findMatchingRoute(ctx);
      if (!route) {
        ctx.status = 404;
        ctx.body = { error: 'Route not found' };
        return;
      }
      pluginCtx.route = route;
      ctx.status = 200;

      for (const pluginName of route.plugins) {
        const plugin = this.plugins.get(pluginName);
        if (plugin?.onRequest) {
          await plugin.onRequest(ctx, pluginCtx);
          if (ctx.status !== 200) return;
        }
      }

      await this.proxyToDownstream(ctx, pluginCtx);
      return;
    } catch (err: any) {
      for (const plugin of this.plugins.values()) {
        if (plugin.onError) {
          await plugin.onError(ctx, err, pluginCtx);
        }
      }
      ctx.status = 500;
      ctx.body = { error: err.message || 'Internal Server Error' };
    }
  }

  /**
   * Proxies the request to the downstream service using either streaming or buffering.
   */
  private async proxyToDownstream(ctx: Koa.Context, pluginCtx: PluginContext): Promise<void> {
    const route = pluginCtx.route!;
    const targetHost = route.downstream.hosts[0];
    const targetUrl = new URL(ctx.path, targetHost);
    const isHttps = targetUrl.protocol === 'https:';

    const options: http.RequestOptions = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: targetUrl.pathname + (targetUrl.search || ''),
      method: ctx.method,
      headers: { ...ctx.headers },
    };

    if (USE_BUFFER_MODE) {
      await this.proxyWithBuffer(ctx, isHttps, options);
    } else {
      await this.proxyWithStream(ctx, isHttps, options);
    }
  }

  /**
   * Proxies the request using streaming (default, efficient for large payloads).
   */
  private async proxyWithStream(ctx: Koa.Context, isHttps: boolean, options: http.RequestOptions): Promise<void> {
    ctx.respond = false;
    await new Promise<void>((resolve, reject) => {
      const proxyReq = (isHttps ? https : http).request(options, proxyRes => {
        ctx.res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(ctx.res, { end: true });
        proxyRes.on('end', resolve);
        proxyRes.on('error', reject);
      });
      proxyReq.on('error', err => {
        if (!ctx.res.headersSent) {
          ctx.res.writeHead(502, { 'Content-Type': 'application/json' });
        }
        ctx.res.end(JSON.stringify({ error: 'Bad Gateway', details: err.message }));
        reject(err);
      });
      if (ctx.req.readable && ctx.method !== 'GET' && ctx.method !== 'HEAD') {
        ctx.req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
    });
  }

  /**
   * Proxies the request using buffering (for debugging or edge cases).
   */
  private async proxyWithBuffer(ctx: Koa.Context, isHttps: boolean, options: http.RequestOptions): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const proxyReq = (isHttps ? https : http).request(options, proxyRes => {
        const chunks: Buffer[] = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          ctx.status = proxyRes.statusCode || 502;
          ctx.body = Buffer.concat(chunks);
          Object.entries(proxyRes.headers).forEach(([key, value]) => {
            if (value !== undefined) ctx.set(key, value as string);
          });
          resolve();
        });
        proxyRes.on('error', reject);
      });
      proxyReq.on('error', err => {
        ctx.status = 502;
        ctx.body = { error: 'Bad Gateway', details: err.message };
        reject(err);
      });
      if (ctx.req.readable && ctx.method !== 'GET' && ctx.method !== 'HEAD') {
        ctx.req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
    });
  }
}
