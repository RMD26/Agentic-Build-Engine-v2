import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      define: {
        // This is just generic value for the GEMINI API key.
        // This is not used at all, and can be ignored!
        'process.env.API_KEY' : JSON.stringify('api-key-this-is-not-used-can-be-ignored!'),
      },
      server: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: true,
        proxy: {
          '/ws-proxy': {target: 'ws://localhost:5000', ws: true},
        },
      },
      preview: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: true,
      },
      plugins: [
        react(),
        {
          name: 'api-proxy-mock',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url && req.url.startsWith('/api-proxy') && req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk;
                });
                req.on('end', () => {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(
                    JSON.stringify({
                      candidates: [
                        {
                          content: {
                            role: 'model',
                            parts: [
                              {
                                text: JSON.stringify([
                                  {
                                    type: 'CREATE_FILE',
                                    filePath: 'src/services/secureAuth.ts',
                                    content:
                                      '// Context-Aware Persona injected code\nexport const validateToken = (token: string): boolean => {\n  if (!token) return false;\n  // Avoid insecure defaults\n  return token.startsWith("secure_hdr_");\n};'
                                  }
                                ])
                              }
                            ]
                          },
                          finishReason: 'STOP'
                        }
                      ]
                    })
                  );
                });
                return;
              }
              next();
            });
          },
          configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url && req.url.startsWith('/api-proxy') && req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk;
                });
                req.on('end', () => {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(
                    JSON.stringify({
                      candidates: [
                        {
                          content: {
                            role: 'model',
                            parts: [
                              {
                                text: JSON.stringify([
                                  {
                                    type: 'CREATE_FILE',
                                    filePath: 'src/services/secureAuth.ts',
                                    content:
                                      '// Context-Aware Persona injected code\nexport const validateToken = (token: string): boolean => {\n  if (!token) return false;\n  // Avoid insecure defaults\n  return token.startsWith("secure_hdr_");\n};'
                                  }
                                ])
                              }
                            ]
                          },
                          finishReason: 'STOP'
                        }
                      ]
                    })
                  );
                });
                return;
              }
              next();
            });
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
