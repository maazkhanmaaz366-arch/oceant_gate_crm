const { spawn } = require('child_process');
const os = require('os');
const http = require('http');

const PORT = parseInt(process.env.PORT || '5000', 10);

function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.')) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalNetworkIP();

console.log('\n================================================================');
console.log('       OCEANGATE CRM — MOBILE & REMOTE ACCESS GATEWAY           ');
console.log('================================================================');
console.log(`  💻 Local PC URL:        http://localhost:${PORT}`);
console.log(`  📱 Same Wi-Fi Mobile:   http://${localIP}:${PORT}  (Fastest & Zero Latency)`);
console.log(`  🔌 Unified Service:     Frontend App + Live /api Backend on Port ${PORT}`);
console.log('----------------------------------------------------------------');

// Probe local server until Express is fully initialized and listening
function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

let isShuttingDown = false;
let sshProcess = null;
let reconnectTimer = null;
let useNoKey = false;

async function waitForServer(port) {
  process.stdout.write(`  ⏳ Waiting for OceanGate server to be ready on port ${port}...`);
  while (!isShuttingDown) {
    const ready = await checkServerReady(port);
    if (ready) {
      console.log(' Ready! 🚀');
      console.log('  Establishing secure worldwide HTTPS tunnel for phone access...\n================================================================\n');
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

function startTunnel() {
  if (isShuttingDown) return;

  // Use Pinggy over Port 443 (SSL port, unblocked by UAE Etisalat / du firewalls)
  const sshArgs = [
    '-p', '443',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'UserKnownHostsFile=/dev/null',
    '-o', 'LogLevel=ERROR',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=3',
    '-R', `0:127.0.0.1:${PORT}`,
    'a.pinggy.io'
  ];

  sshProcess = spawn('ssh', sshArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

  sshProcess.stdout.on('data', (data) => {
    const text = data.toString();

    // Look for Pinggy URL: e.g. https://xxxx.free.pinggy.net or https://xxxx.run.pinggy-free.link
    const match = text.match(/https:\/\/[a-zA-Z0-9.\-_]+pinggy[a-zA-Z0-9.\-_]*/);
    if (match) {
      const publicUrl = match[0].trim();
      console.log('\n****************************************************************');
      console.log('  🎉 LIVE WORLDWIDE HTTPS URL (OPEN IN DUBAI / ANYWHERE):');
      console.log(`  👉 ${publicUrl}`);
      console.log('****************************************************************\n');
      console.log('  Send this exact link to your contact or client in Dubai.');
      console.log('  Works on mobile and desktop without any passwords or VPN!\n');
    }

    if (text.includes('QR:') || text.includes('▄') || text.includes('█')) {
      process.stdout.write(text);
    }
  });

  sshProcess.stderr.on('data', (data) => {
    const errText = data.toString();
    if (!errText.includes('Warning: Permanently added') && !errText.includes('Pseudo-terminal')) {
      console.warn('Tunnel Notice:', errText.trim());
    }
  });

  sshProcess.on('close', (code) => {
    if (!isShuttingDown) {
      console.log('\n⚠️  Tunnel reconnecting in 3s...');
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(startTunnel, 3000);
    }
  });

  sshProcess.on('error', (err) => {
    console.error('Failed to spawn ssh tunnel:', err.message);
  });
}

// Graceful cleanup
function cleanup() {
  isShuttingDown = true;
  clearTimeout(reconnectTimer);
  if (sshProcess) {
    try { sshProcess.kill('SIGTERM'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Initialize: wait for port 5000 to be live first, then establish tunnel
(async () => {
  await waitForServer(PORT);
  startTunnel();
})();
