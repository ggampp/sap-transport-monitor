#!/bin/bash

# SAP Basis Cockpit - BTP Deployment Script

echo "🚀 Deploying SAP Basis Cockpit to BTP..."

# Check if CF CLI is installed
if ! command -v cf &> /dev/null; then
    echo "❌ Cloud Foundry CLI is not installed. Please install CF CLI first."
    exit 1
fi

# Check if logged in to BTP
if ! cf target &> /dev/null; then
    echo "❌ Not logged in to Cloud Foundry. Please run 'cf login' first."
    exit 1
fi

# Create environment file for BTP
echo "📝 Creating BTP environment configuration..."
cat > .env << EOF
# BTP Production Environment Variables
NODE_ENV=production
BTP_DEPLOYMENT=true

# Database configuration will be provided by BTP service binding
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD will be set automatically
# by the PostgreSQL service binding in BTP

# Application Configuration
PORT=\${PORT:-5000}
EOF

# Install dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Deploy to BTP
echo "🚀 Deploying to BTP..."
cf push

echo "✅ Deployment completed!"
echo "🌐 Application URL: https://your-app-name.cfapps.us10-001.hana.ondemand.com"
echo "🗄️  Database: Managed PostgreSQL service in BTP"
echo ""
echo "To view logs: cf logs your-app-name"
echo "To scale: cf scale your-app-name -i 2"
