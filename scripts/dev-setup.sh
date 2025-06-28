#!/bin/bash

echo "🚀 Setting up Vireo API Gateway Development Environment"

cd "$(dirname "$0")/.."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

echo "🔨 Building and starting development environment..."
docker-compose -f docker-compose.dev.yml up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔍 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Access Points:"
echo "   Application: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   RabbitMQ Management: http://localhost:15672 (user: vireo, pass: vireo123)"
echo "   RabbitMQ DLQ Management: http://localhost:15673 (user: vireo, pass: vireo123)"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart app: docker-compose -f docker-compose.dev.yml restart app" 