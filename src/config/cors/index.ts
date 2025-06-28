import cors, { Options } from '@koa/cors';
import { isEmpty, isUndefined } from 'lodash';
import { EnvironmentConfig } from '../environment';

const MAX_AGE_IN_SECS =  86400

export const getCorsConfig = (env: EnvironmentConfig): Options => {
  if (env.nodeEnv === 'production') {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');
    if (isUndefined(allowedOrigins) || isEmpty(allowedOrigins)) {
      return {
        origin: undefined, // Disable CORS if no origins are configured
        credentials: false,
      };
    }
    return {
      origin: (ctx: any) => {
        const origin = ctx.get('Origin');
        if (allowedOrigins && allowedOrigins.includes(origin)) {
          return origin;
        }
        return allowedOrigins[0];
      },
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        'Accept',
        'Origin',
      ],
      exposeHeaders: ['X-Request-ID', 'X-Response-Time'],
      maxAge: MAX_AGE_IN_SECS,
    };
  }

  // Development configuration
  return {
    origin: '*', // Allow all origins in development
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'Accept',
      'Origin',
    ],
    exposeHeaders: ['X-Request-ID', 'X-Response-Time'],
    maxAge: MAX_AGE_IN_SECS,
  };
};

export const corsMiddleware = (config: Options) => {
  return cors(config);
}; 