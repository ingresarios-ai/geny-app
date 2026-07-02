import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import chatHandler from './api/chat'

export default defineConfig({
  plugins: [
    react(),
    {
      // En desarrollo sirve /api/chat con el mismo handler que usa el hosting.
      name: 'dev-api-chat',
      configureServer(server) {
        server.middlewares.use('/api/chat', (req, res) => {
          void chatHandler(req, res)
        })
      },
    },
  ],
  server: { port: 5193 },
})
