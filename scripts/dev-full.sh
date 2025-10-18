#!/bin/bash

# SAP Basis Cockpit - Full Development Setup Script
# This script sets up both the backend and React frontend

echo "🚀 Setting up SAP Basis Cockpit..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file for local development
echo "📝 Creating local environment configuration..."
cat > .env.local << EOF
# Local Development Environment Variables
NODE_ENV=development

# Local PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sap_basis_cockpit
DB_USER=sap_user
DB_PASSWORD=sap_password

# Application Configuration
PORT=5000
EOF

# Start PostgreSQL with Docker Compose
echo "🐳 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose exec postgres pg_isready -U sap_user -d sap_basis_cockpit; do
    echo "⏳ Database is not ready yet, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Start the application
echo "🚀 Starting SAP Basis Cockpit..."
echo "📊 Application will be available at: http://localhost:5000"
echo "🗄️  Database will be available at: localhost:5432"
echo "🔧 PgAdmin will be available at: http://localhost:8080"
echo ""
echo "The application is ready to use!"
echo "To stop the services, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"

# Load environment variables and start the app
export $(grep -v '^#' .env.local | xargs) && npm start
