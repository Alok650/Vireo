#!/bin/bash

echo "🛑 Stopping Vireo API Gateway Development Environment"

cd "$(dirname "$0")/.."

docker-compose -f docker-compose.dev.yml down

echo "✅ Development environment stopped!"
echo ""
echo "📋 To start again, run: ./scripts/dev-setup.sh" 