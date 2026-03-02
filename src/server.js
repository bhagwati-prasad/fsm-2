/**
 * Express Server
 * Main server entry point
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const SRC_ROOT = path.join(__dirname, '../src');
const UNBUNDLED_MODE = process.env.UNBUNDLED === 'true';

function resolveSourceModule(modulePath) {
  const normalizedRequest = path.normalize(modulePath).replace(/^([/\\])+/, '');
  const basePath = path.join(SRC_ROOT, normalizedRequest);
  const indexPath = path.join(basePath, 'index.js');
  const candidates = [
    { path: basePath, isDirectoryIndex: false },
    { path: `${basePath}.js`, isDirectoryIndex: false },
    { path: indexPath, isDirectoryIndex: true }
  ];

  for (const candidate of candidates) {
    const normalizedCandidate = path.normalize(candidate.path);
    if (!normalizedCandidate.startsWith(SRC_ROOT)) {
      continue;
    }

    if (fs.existsSync(normalizedCandidate) && fs.statSync(normalizedCandidate).isFile()) {
      return {
        filePath: normalizedCandidate,
        normalizedRequest,
        isDirectoryIndex: candidate.isDirectoryIndex
      };
    }
  }

  return null;
}

// Middleware
app.use(compression());
app.use(express.json());

if (UNBUNDLED_MODE) {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.unbundled.html'));
  });

  app.get('/src/*', (req, res, next) => {
    const requestedModule = req.params[0] || '';
    const resolvedModule = resolveSourceModule(requestedModule);

    if (!resolvedModule) {
      return next();
    }

    if (resolvedModule.isDirectoryIndex) {
      return res.redirect(`/src/${resolvedModule.normalizedRequest}/index.js`);
    }

    res.type('application/javascript');
    return res.sendFile(resolvedModule.filePath);
  });
}

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API endpoints
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'Cloud-Native Architecture FSM Tool',
    buildDate: '2026-02-22'
  });
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Echo back
      ws.send(JSON.stringify({
        status: 'received',
        data: data
      }));
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        status: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;
