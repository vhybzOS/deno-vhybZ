# deno-vhybZ

Backend for vhybZ - A Fresh 2.0 web application with MongoDB and Google OAuth.

## Quick Start

1. **Install Deno**: https://docs.deno.com/runtime/getting_started/installation
2. **Setup MongoDB** (see [Database Setup](#database-setup) below)
3. **Configure OAuth** (see [Authentication Setup](#authentication-setup) below)
4. **Start development**:
   ```bash
   deno task dev
   ```

## Database Setup

### MongoDB Configuration

The application automatically detects your environment and configures MongoDB connection:

- **Windows**: Uses `mongodb://localhost:27017`
- **macOS/Linux**: Uses `mongodb://localhost:27017`
- **WSL2**: Automatically detects Windows host IP and uses `mongodb://WINDOWS_HOST_IP:27017`
- **Production**: Set `MONGODB_URI` environment variable

### Windows + WSL2 Setup

If you're running the app in WSL2 but have MongoDB installed on Windows, you need to configure MongoDB to accept external connections:

1. **Edit MongoDB Configuration** (`C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`):
   ```yaml
   net:
     port: 27017
     bindIp: 0.0.0.0  # Allow connections from any IP (change from 127.0.0.1)
   ```

2. **Restart MongoDB Service**:
   - Open Services (Win+R → `services.msc`)
   - Find "MongoDB Server"
   - Right-click → Restart

3. **Configure Windows Firewall** (if needed):
   ```powershell
   # Run as Administrator
   New-NetFirewallRule -DisplayName "MongoDB" -Direction Inbound -Protocol TCP -LocalPort 27017 -Action Allow
   ```

4. **Verify Connection** from WSL2:
   ```bash
   # Get Windows host IP
   ip route show | grep -i default
   
   # Test MongoDB connection (if you have mongo client)
   mongo --host WINDOWS_HOST_IP:27017
   ```

### Alternative: Local MongoDB in WSL2

Instead of using Windows MongoDB, you can install MongoDB directly in WSL2:

```bash
# Install MongoDB in WSL2
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Authentication Setup

Set up Google OAuth for authentication:

1. **Create Google Cloud Project**: https://console.cloud.google.com/
2. **Enable Google+ API**
3. **Create OAuth 2.0 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/auth/google/callback`
4. **Set Environment Variables**:
   ```bash
   export GOOGLE_CLIENT_ID="your-client-id"
   export GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | Auto-detected | MongoDB connection string |
| `MONGODB_DB_NAME` | `vhybZ` | Database name |
| `GOOGLE_CLIENT_ID` | Required | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Required | Google OAuth client secret |

## Development

### Available Commands

```bash
# Start development server (auto-detects environment)
deno task dev

# Build for production
deno task build

# Start production server
deno task start

# Run all checks (formatting, linting, type checking)
deno task check

# Update Fresh framework
deno task update

# React app development (in web-vhybZ/ directory)
cd web-vhybZ && npm run dev
```

### Supported Environments

This application works seamlessly across:

1. **Deno Deploy** - Production hosting
2. **Windows** - Direct development
3. **WSL2** - Windows Subsystem for Linux
4. **Linux** - Native development
5. **macOS** - Native development

The `dev.ts` script automatically detects your environment and configures MongoDB connections appropriately.

## Architecture

- **Framework**: Fresh 2.0 with file-based routing
- **Runtime**: Deno with JSR package management
- **UI**: Preact + Tailwind CSS
- **Database**: MongoDB with Zod validation
- **Auth**: Google OAuth 2.0 with session cookies
- **Frontend**: React app served from `/` route

## Project Structure

```
├── main.ts           # Core application with OAuth routes
├── dev.ts            # Development server with environment detection
├── database.ts       # MongoDB operations with Zod schemas
├── routes/           # Fresh file-based routing
├── islands/          # Interactive Preact components
├── components/       # Server-side Preact components
├── web-vhybZ/        # React frontend application
└── static/           # Static assets
```
