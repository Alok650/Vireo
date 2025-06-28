.PHONY: help install build dev test clean docker-build docker-run docker-stop docker-logs

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

build: ## Build the application
	npm run build

dev: ## Start development server
	npm run dev

test: ## Run tests
	npm test

clean: ## Clean build artifacts
	rm -rf dist
	rm -rf node_modules

docker-build: ## Build Docker image
	docker build -t vireo-api-gateway .

docker-run: ## Run with docker-compose
	docker-compose up -d

docker-stop: ## Stop docker-compose services
	docker-compose down

docker-logs: ## Show docker-compose logs
	docker-compose logs -f

dev-setup: ## Setup development environment
	./scripts/dev-setup.sh

dev-stop: ## Stop development environment
	./scripts/dev-stop.sh

dev-logs: ## Show development logs
	./scripts/dev-logs.sh

health: ## Check application health (HTTP)
	curl http://localhost:3000/health

lint: ## Run ESLint
	npm run lint-fix

format: ## Format code with Prettier
	npm run style-fix

production: ## Deploy to production
	docker-compose up -d --build

production-logs: ## Show production logs
	docker-compose logs -f app 