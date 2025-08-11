import { buildServer } from './server.js';

const { httpServer } = buildServer();
const port = Number(process.env.BACKEND_PORT || 8080);
httpServer.listen(port, '0.0.0.0', () => {
  console.log('backend listening on', port);
});
