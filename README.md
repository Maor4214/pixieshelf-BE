# PixieShelf Backend with Reverse Proxy

This backend server is configured to act as a reverse proxy for development, forwarding non-API requests to the Vite dev server while handling API requests directly.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:3031`

### 3. Start the Frontend (Vite Dev Server)
In a separate terminal, navigate to the frontend directory and start the Vite dev server:
```bash
cd ../pixieshelf FE
npm run dev
```

The frontend should be running on `http://localhost:5173`

## How It Works

- **API Routes** (`/api/*`): Handled directly by the backend
- **All Other Routes** (`/`, `/home`, `/products`, etc.): Proxied to the Vite dev server

## Development Workflow

1. Start the backend server first: `npm run dev`
2. Start the frontend Vite dev server: `npm run dev` (in frontend directory)
3. Access your application through the backend URL: `http://localhost:3031`
4. All frontend routes will be proxied to the Vite dev server
5. API calls will be handled directly by the backend

## Benefits

- Single entry point for all requests
- API and frontend served from the same origin
- No CORS issues in development
- Hot Module Replacement (HMR) still works
- No build step required for development

## Production

In production mode (`NODE_ENV=production`), the proxy is disabled and the backend serves static files from the `public` directory. 