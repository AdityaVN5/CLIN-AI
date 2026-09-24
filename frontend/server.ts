import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const PYTHON_PORT = process.env.PYTHON_PORT || 8000;
const PYTHON_HOST = process.env.PYTHON_HOST || '127.0.0.1';

// Proxy /api/* to the Python FastAPI backend
app.use('/api', (req: Request, res: Response) => {
  const options: http.RequestOptions = {
    hostname: PYTHON_HOST,
    port: PYTHON_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${PYTHON_HOST}:${PYTHON_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err: any) => {
    console.warn(`[Proxy Notice] Python backend at http://${PYTHON_HOST}:${PYTHON_PORT} not reachable:`, err.message);
    res.status(503).json({
      error: 'Python backend offline',
      message: `Could not connect to FastAPI server at http://${PYTHON_HOST}:${PYTHON_PORT}. Please ensure 'python api_server.py' is running.`,
      detail: err.message,
    });
  });

  req.pipe(proxyReq);
});

// Configure Vite middleware in development or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Clin AT React Application running on http://localhost:${port}`);
    console.log(`Connecting to Python AI Pipeline at http://${PYTHON_HOST}:${PYTHON_PORT}`);
  });
}

startServer();
