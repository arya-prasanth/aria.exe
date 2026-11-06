
import { defineConfig, type Plugin } from 'vite'

import letterboxdHandler from './api/letterboxd.ts'
import substackHandler from './api/substack.ts'

type ApiHandler = (req: any, res: any) => Promise<any> | any

function createApiMiddleware(handler: ApiHandler) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }

    const responseAdapter = {
      statusCode: 200,

      status(code: number) {
        this.statusCode = code
        return this
      },

      setHeader(name: string, value: string) {
        res.setHeader(name, value)
        return this
      },

      json(data: unknown) {
        res.statusCode = this.statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
        return this
      },
    }

    try {
      await handler(req, responseAdapter)
    } catch (error) {
      console.error('API middleware error:', error)

      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          error: 'Internal server error',
        }))
      }
    }
  }
}

function archiveApiPlugin(): Plugin {
  return {
    name: 'archive-api',

    configureServer(server) {
      server.middlewares.use(
        '/api/letterboxd',
        createApiMiddleware(letterboxdHandler)
      )

      server.middlewares.use(
        '/api/substack',
        createApiMiddleware(substackHandler)
      )
    },
  }
}

export default defineConfig({
  plugins: [archiveApiPlugin()],

  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
  },

  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: false,
  },

  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        archive: 'archive.html',
      },
    },
  },
})
