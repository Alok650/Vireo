import { get } from 'lodash';

export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  region: string;
}

class EnvironmentManager {
  private config: EnvironmentConfig | null = null;

  loadConfig(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    this.config = {
      port: parseInt(get(process.env, 'APPLICATION_PORT', '3000'), 10),
      nodeEnv: get(process.env, 'NODE_ENV', 'development'),
      region: get(process.env, 'AWS_REGION', 'us-east-1'),
    };

    return this.config;
  }

  getConfig(): EnvironmentConfig | null {
    return this.config;
  }
}

export const environmentManager = new EnvironmentManager();
export default environmentManager;
