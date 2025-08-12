import { buildServer } from './server.js';

const { app } = buildServer();
const port = Number(process.env.BACKEND_PORT || 8080);
app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('backend listening on', port);
});
