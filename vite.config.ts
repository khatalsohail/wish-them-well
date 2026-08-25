import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

// In-memory + file-backed storage for short cards
const CARDS_FILE = path.resolve(__dirname, '.cards_store.json');
let cardsMap: Record<string, any> = {};

try {
  if (fs.existsSync(CARDS_FILE)) {
    const raw = fs.readFileSync(CARDS_FILE, 'utf-8');
    cardsMap = JSON.parse(raw);
  }
} catch (e) {
  cardsMap = {};
}

function persistCards() {
  try {
    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsMap, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
}

function generateShortId(length = 6): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function cardStoragePlugin(): Plugin {
  return {
    name: 'card-storage-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // POST /api/cards
        if (req.method === 'POST' && (url === '/api/cards' || url.startsWith('/api/cards?'))) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const cardData = parsed.data || parsed;
              
              let shortId = parsed.customId || generateShortId();
              while (cardsMap[shortId] && !parsed.overwrite) {
                shortId = generateShortId();
              }

              cardsMap[shortId] = {
                data: cardData,
                createdAt: Date.now(),
              };
              persistCards();

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, id: shortId }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err?.message || 'Invalid JSON' }));
            }
          });
          return;
        }

        // GET /api/cards/:id
        if (req.method === 'GET' && url.startsWith('/api/cards/')) {
          const id = url.replace('/api/cards/', '').split('?')[0];
          if (id && cardsMap[id]) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, id, data: cardsMap[id].data }));
            return;
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Card not found' }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cardStoragePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
