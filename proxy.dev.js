import { createProxyMiddleware } from 'http-proxy-middleware'

export function setupProxy(app) {
  // Simple proxy for development
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
