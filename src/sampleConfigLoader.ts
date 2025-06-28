import fs from 'fs';
import path from 'path';
import { GatewayPlugin, Route } from './plugins/gateway-core';

export function loadSampleConfig(): { plugins: GatewayPlugin[]; routes: Route[] } {
  const configPath = path.join(__dirname, 'sample-config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const plugins: GatewayPlugin[] = parsed.plugins.map((p: any) => {
    const plugin: GatewayPlugin = { ...p };
    if (typeof p.onRequest === 'string') {
      // eslint-disable-next-line no-new-func
      plugin.onRequest = new Function('ctx', 'pluginCtx', p.onRequest.replace(/^function\(ctx, pluginCtx\) \{ |\}$/g, '')) as any;
    }
    return plugin;
  });
  return {
    plugins,
    routes: parsed.routes,
  };
} 