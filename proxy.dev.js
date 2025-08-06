import { createProxyMiddleware } from 'http-proxy-middleware'

export function setupProxy(app) {
  // Skip API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next()
    }
    next()
  })

  // Proxy everything else to Vite dev server
  app.use(
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message)
        res
          .status(500)
          .send('Proxy error: Vite dev server might not be running')
      },
    })
  )
}
