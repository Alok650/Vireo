import dotenv from 'dotenv';
import { App } from './app';

dotenv.config();

class ServerManager {
  private app: App | null = null;

  async start(): Promise<void> {
    try {
      this.app = new App();
      await this.app.start();

      console.log('🎉 Vireo API Gateway is ready!');
      console.log('📋 Available endpoints:');
      console.log('   GET  /health - Health check');
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    if (this.app) {
      await this.app.stop();
    }
  }

  setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  setupErrorHandling(): void {
    process.on('uncaughtException', error => {
      console.error('💥 Uncaught Exception:', error);
      this.stop().then(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.stop().then(() => process.exit(1));
    });
  }
}

async function main(): Promise<void> {
  const serverManager = new ServerManager();

  serverManager.setupErrorHandling();
  serverManager.setupGracefulShutdown();

  await serverManager.start();
}

main().catch(error => {
  console.error('💥 Fatal error during startup:', error);
  process.exit(1);
});
