# SAP Basis Cockpit

A comprehensive monitoring and administration cockpit for SAP Basis operations, including transport management, user administration, and analytics.

## 🚀 Quick Start

### Local Development

1. **Setup with Docker (Recommended)**
   ```bash
   npm run dev:setup
   ```
   This will:
   - Start PostgreSQL database with Docker
   - Create sample data
   - Install dependencies
   - Start the application

2. **Manual Setup**
   ```bash
   # Start database
   npm run dev:docker
   
   # Install dependencies
   npm install
   
   # Start application
   npm run dev
   ```

### BTP Deployment

1. **Deploy to SAP BTP**
   ```bash
   npm run deploy:btp
   ```

## 🗄️ Database Configuration

### Local Development
- **Database**: PostgreSQL (Docker)
- **Host**: localhost:5432
- **Database**: sap_basis_cockpit
- **User**: sap_user
- **Password**: sap_password
- **PgAdmin**: http://localhost:8080

### BTP Production
- **Database**: Managed PostgreSQL service
- **Configuration**: Automatic via service binding
- **SSL**: Enabled with certificate validation

## 📊 Features

### Dashboard
- Transport management (Requests, Notes, Upgrades)
- Real-time status tracking
- User-friendly interface

### Analytics
- Transport analytics with date filtering
- Status distribution charts
- Performance metrics

### User Administration
- User CRUD operations
- Profile and role management
- SOX compliance review
- Audit logging

### Metrics
- System performance indicators
- User activity metrics
- Compliance tracking

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev:setup      # Complete local setup
npm run dev:docker     # Start database only
npm run dev:stop       # Stop database
npm run dev:logs       # View database logs

# Database
npm run db:reset       # Reset database with fresh data
npm run db:logs        # View database logs

# Deployment
npm run deploy:btp     # Deploy to BTP
```

### Environment Variables

#### Local Development (.env.local)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sap_basis_cockpit
DB_USER=sap_user
DB_PASSWORD=sap_password
PORT=5000
```

#### BTP Production
Environment variables are automatically configured via service binding.

## 🐳 Docker Services

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Health Check**: Enabled
- **Data Persistence**: Docker volume

### PgAdmin
- **Image**: dpage/pgadmin4:latest
- **Port**: 8080
- **Email**: admin@sapbasis.com
- **Password**: admin123

## 🔧 Configuration

### Database Connection Logic

The application automatically detects the environment:

1. **Local Development**: Uses Docker PostgreSQL
2. **BTP Production**: Uses managed PostgreSQL service

Detection criteria:
- `NODE_ENV=production`
- `VCAP_SERVICES` environment variable
- `BTP_DEPLOYMENT` environment variable

### Service Binding (BTP)

The application expects a PostgreSQL service named `postgresql-db` in the BTP environment.

## 📁 Project Structure

```
├── config/
│   └── database.js          # Database configuration
├── src/
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   ├── init-local.sql   # Local sample data
│   │   ├── init.js          # Database initialization
│   │   └── *.js             # Service layers
│   └── routes/
│       └── *.js             # API routes
├── public/
│   └── *.html               # Frontend pages
├── scripts/
│   ├── dev-setup.sh         # Development setup
│   └── btp-deploy.sh        # BTP deployment
├── docker-compose.yml       # Docker services
└── manifest.yml            # BTP deployment manifest
```

## 🔐 Security

- SSL/TLS encryption for database connections
- Parameterized queries (SQL injection prevention)
- Audit logging for compliance
- Role-based access control

## 📈 Monitoring

- Health check endpoints
- Database connection monitoring
- Performance metrics
- Error logging and tracking

## 🚀 Deployment

### BTP Deployment Steps

1. **Login to BTP**
   ```bash
   cf login
   ```

2. **Create PostgreSQL Service**
   ```bash
   cf create-service postgresql-db free postgresql-db
   ```

3. **Deploy Application**
   ```bash
   npm run deploy:btp
   ```

4. **Bind Service**
   ```bash
   cf bind-service sap-basis-cockpit postgresql-db
   ```

5. **Restart Application**
   ```bash
   cf restart sap-basis-cockpit
   ```

## 🆘 Troubleshooting

### Local Development
- **Database not starting**: Check Docker is running
- **Connection refused**: Wait for database to be ready
- **Permission denied**: Run `chmod +x scripts/*.sh`

### BTP Deployment
- **Service binding failed**: Ensure PostgreSQL service exists
- **Database connection failed**: Check service credentials
- **Application not starting**: Check logs with `cf logs sap-basis-cockpit`

## 📞 Support

For issues and questions:
1. Check the logs: `npm run dev:logs` (local) or `cf logs sap-basis-cockpit` (BTP)
2. Verify database connection
3. Check environment variables
4. Review service bindings (BTP)
