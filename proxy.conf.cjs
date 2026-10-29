const path = require('node:path');

// Angular's asset middleware runs before Vite's proxy middleware. Use Vite's
// static file path so the rewrite still serves the asset with its JSON MIME type.
module.exports = {
  '^/health(?:\\?.*)?$': {
    bypass: () => `/@fs/${path.join(__dirname, 'public/health.json')}`,
  },
};
