import { createProxyMiddleware } from 'http-proxy-middleware'

export function setupProxy(app) {
  // Only proxy non-API routes to avoid conflicts
  app.use(
    ['/', '/static', '/assets', '/*.js', '/*.css', '/*.html'],
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
      logLevel: 'silent', // Change from 'debug' to reduce noise
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message)
        if (!res.headersSent) {
          res.status(500).send('Proxy error: Vite dev server might not be running')
        }
      },
      // Skip proxy for API routes
      skip: (req) => req.originalUrl.startsWith('/api')
    })
  )
}