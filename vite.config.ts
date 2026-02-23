import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Handle browser extension API endpoint
    {
      name: 'browser-extension-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/browser_extension')) {
            // Simple response for browser extension
            // In production, this goes to Netlify function
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
            
            // Return not authenticated for now (user must deploy to Netlify for full functionality)
            res.statusCode = 200;
            res.end(JSON.stringify({
              isKamiApiSuccessfulResponse: true,
              user: null,
              message: 'Not authenticated - deploy to Netlify for full functionality'
            }));
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
