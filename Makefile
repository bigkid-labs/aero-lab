.PHONY: dev dev-api dev-web migrate test build db-reset

# Start backing services (Postgres + MinIO)
dev:
	docker compose up -d
	@echo ""
	@echo "  Postgres  → localhost:5432"
	@echo "  MinIO S3  → localhost:9000"
	@echo "  MinIO UI  → localhost:9001"
	@echo ""
	@echo "  Run API:  make dev-api"
	@echo "  Run Web:  make dev-web"

dev-api:
	cd apps/api && cargo run

dev-web:
	cd apps/web && npm run dev

# Run sqlx migrations (reads DATABASE_URL from .env)
migrate:
	cd apps/api && export $$(grep -v '^#' ../../.env | xargs) && cargo sqlx migrate run

# Run all tests
test:
	cd apps/api && cargo test
	cd apps/web && npm test

# Production builds
build:
	cd apps/api && cargo build --release
	cd apps/web && npm run build

# Wipe DB volumes and restart fresh
db-reset:
	docker compose down -v
	docker compose up -d postgres
	@echo "Waiting for Postgres..." && sleep 3
	@sleep 3
	$(MAKE) migrate
