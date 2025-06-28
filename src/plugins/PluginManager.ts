import Koa from 'koa';
import { map, isEmpty } from 'lodash';

export interface Plugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  registerRoutes(app: Koa): void;
  destroy(): Promise<void>;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  async registerPlugin(plugin: Plugin): Promise<void> {
    try {
      await plugin.initialize();
      this.plugins.set(plugin.name, plugin);
      console.log(
        `✅ Plugin ${plugin.name} v${plugin.version} registered successfully`
      );
    } catch (error) {
      console.error(`❌ Failed to register plugin ${plugin.name}:`, error);
      throw error;
    }
  }

  registerRoutes(app: Koa): void {
    this.plugins.forEach(plugin => {
      try {
        plugin.registerRoutes(app);
        console.log(`🛣️  Routes registered for plugin: ${plugin.name}`);
      } catch (error) {
        console.error(
          `❌ Failed to register routes for plugin ${plugin.name}:`,
          error
        );
      }
    });
  }

  async destroyAll(): Promise<void> {
    const destroyPromises = map(Array.from(this.plugins.values()), async plugin => {
      try {
        await plugin.destroy();
        console.log(`🔄 Plugin ${plugin.name} destroyed successfully`);
      } catch (error) {
        console.error(`❌ Failed to destroy plugin ${plugin.name}:`, error);
      }
    });

    await Promise.all(destroyPromises);
    this.plugins.clear();
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getPluginCount(): number {
    return this.plugins.size;
  }

  hasPlugins(): boolean {
    return !isEmpty(this.plugins);
  }
}
