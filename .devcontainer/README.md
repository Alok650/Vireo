# Vireo API Gateway - Development Container

This development container provides a complete development environment for the Vireo API Gateway with all necessary dependencies.

## 🚀 Quick Start

1. **Install Docker Desktop** and ensure it's running
2. **Install VS Code** with the Remote - Containers extension
3. **Open the project** in VS Code
4. **Reopen in Container** when prompted (or press `Ctrl+Shift+P` → "Remote-Containers: Reopen in Container")

## 📦 What's Included

### Application

- **Node.js 18** with TypeScript support
- **Hot reload** development server
- **ESLint** and **Prettier** for code formatting
- **Git** integration

### Dependencies

- **MySQL 8.0** - Primary database
- **Redis 7** - Caching layer
- **RabbitMQ 3** - Message queue
- **RabbitMQ DLQ** - Dead letter queue

### VS Code Extensions

- TypeScript support
- ESLint integration
- Prettier formatting
- Docker tools
- GitHub Copilot
- Remote development

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run style-fix

# Lint code
npm run lint-fix
```

## 🌐 Access Points

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **RabbitMQ Management**: http://localhost:15672 (user: vireo, pass: vireo123)
- **RabbitMQ DLQ Management**: http://localhost:15673 (user: vireo, pass: vireo123)

## 📁 Project Structure

```
/app
├── src/                    # Source code
│   ├── config/            # Configuration
│   ├── plugins/           # Plugin system
│   ├── app.ts            # Main application
│   └── index.ts          # Entry point
├── dist/                  # Built files
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🐛 Troubleshooting

### Container won't start

- Ensure Docker Desktop is running
- Check if ports 3000, 3306, 6379, 5672, 15672 are available
- Try `docker-compose down` and restart

### Database connection issues

- Wait for MySQL to fully start (may take 30-60 seconds)
- Check container logs: `docker-compose logs db`

### Hot reload not working

- Ensure the volume mount is working correctly
- Check file permissions in the container
