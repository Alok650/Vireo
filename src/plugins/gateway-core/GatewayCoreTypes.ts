import Koa from 'koa';

export interface PluginContext {
  requestId: string;
  startTime: number;
  metadata: Map<string, any>;
  route?: Route;
  downstream?: DownstreamService;
  metrics: RequestMetrics;
}

export interface GatewayPlugin {
  name: string;
  version: string;
  priority: number;
  onRequest?(ctx: Koa.Context, pluginCtx: PluginContext): Promise<void>;
  onResponse?(ctx: Koa.Context, pluginCtx: PluginContext): Promise<void>;
  onError?(ctx: Koa.Context, err: Error, pluginCtx: PluginContext): Promise<void>;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}

export interface Route {
  id: string;
  name: string;
  methods: string[];
  paths: string[];
  hosts?: string[];
  headers?: Record<string, string | string[]>;
  query?: Record<string, string | string[]>;
  priority?: number;
  regex?: string;
  downstream: DownstreamService;
  plugins: string[];
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
}

export interface DownstreamService {
  name: string;
  hosts: string[];
  healthCheck?: HealthCheckConfig;
  loadBalancer?: LoadBalancerConfig;
  timeout?: number;
  connectTimeout?: number;
  readTimeout?: number;
  writeTimeout?: number;
  retries?: number;
}

export interface HealthCheckConfig {
  path: string;
  interval: number;
  timeout: number;
}

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted';
  weights?: number[];
}

export interface RequestMetrics {
  [key: string]: any;
}
