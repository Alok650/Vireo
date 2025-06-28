# Vireo - API Gateway

## Project Overview

A lightweight, high-performance API gateway built with Node.js and TypeScript that provides essential gateway functionality similar to Kong but with a focus on simplicity and extensibility.

## Core Features

### 1. Rate Limiting

- Per-IP rate limiting
- Per-user rate limiting (with JWT tokens)
- Sliding window and fixed window algorithms
- Dynamic rate limit adjustment based on user tiers
- Rate limit headers in responses (X-RateLimit-\*)

### 2. IP Blocking/Whitelisting

- Global IP blacklist/whitelist
- Per-route IP restrictions
- Geographic IP blocking
- Automatic blocking of suspicious IPs (brute force detection)
- Temporary and permanent blocks

### 3. Maintenance Mode

- Global maintenance mode
- Per-service maintenance mode
- Custom maintenance responses
- Scheduled maintenance windows
- Bypass for admin IPs

### 4. Retry Logic

- Configurable retry attempts
- Exponential backoff
- Circuit breaker pattern
- Retry on specific HTTP status codes
- Retry budget per client

### 5. Authentication & Authorization

- JWT token validation
- API key authentication
- OAuth2 integration
- Role-based access control (RBAC)
- Custom authentication plugins

## Additional Suggested Features

### 6. Request/Response Transformation

- Header modification
- Request body transformation
- Response caching
- Response compression
- CORS handling

### 7. Load Balancing

- Round-robin load balancing
- Weighted load balancing
- Health check-based routing
- Service discovery integration
- Sticky sessions

### 8. Monitoring & Analytics

- Request/response logging
- Performance metrics
- Error tracking
- Real-time dashboards
- Alerting system

### 9. Security Features

- Request validation
- SQL injection protection
- XSS protection
- Request size limits
- HTTPS enforcement

### 10. Advanced Routing

- Path-based routing
- Header-based routing
- Query parameter routing
- A/B testing support

## Technology Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Koa.js
- **Database**: Redis (rate limiting, caching) + MySQL (config, analytics)
- **Message Queue**: RabbitMQ (async processing)
- **Authentication**: JWT, API keys
- **Monitoring**: Winston, Prometheus metrics
- **Testing**: Jest + Supertest
- **Deployment**: Docker + Docker Compose

## Benefits

- **Lightweight**: Minimal resource footprint compared to Kong
- **Customizable**: Plugin-based architecture for easy extension
- **High Performance**: Built with performance in mind
- **Developer Friendly**: TypeScript for better development experience
- **Production Ready**: Built-in monitoring and health checks
