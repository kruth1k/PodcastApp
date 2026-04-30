const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from test server');
});
server.listen(3005, '127.0.0.1', () => {
  console.log('Test server running on http://127.0.0.1:3005');
});

setTimeout(() => {
  console.log('Timeout - exiting');
  process.exit(0);
}, 60000);