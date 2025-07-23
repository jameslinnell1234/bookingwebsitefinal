const path = require('path');

console.log("🟢 custom-server.js execution has started.");

process.env.NODE_ENV = 'production';
process.chdir(__dirname);

const dir = path.join(__dirname);
const currentPort = parseInt(process.env.PORT, 10) || 8080;
const hostname = process.env.HOSTNAME || '0.0.0.0';
let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);

// Validate keepAliveTimeout
if (
  Number.isNaN(keepAliveTimeout) ||
  !Number.isFinite(keepAliveTimeout) ||
  keepAliveTimeout < 0
) {
  keepAliveTimeout = undefined;
}

// Patch webpack field to avoid crash
let nextConfig = {};
try {
  nextConfig = {
    ...JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG || '{}'),
    webpack(config, options) {
      return config;
    },
  };
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);
  console.log("🟢 Configuration injected.");
} catch (err) {
  console.error("⚠️ Failed to parse config:", err);
}

try {
  const { startServer } = require('next/dist/server/lib/start-server');
  console.log("🟢 startServer imported successfully.");

  startServer({
    dir,
    isDev: false,
    config: nextConfig,
    hostname,
    port: currentPort,
    allowRetry: false,
    keepAliveTimeout,
  });
} catch (err) {
  console.error("🔥 CRITICAL failure in custom-server.js:", err);
  process.exit(1);
}