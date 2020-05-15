import { runArtsyTests } from './artsy';
import express from 'express';
import type { Server } from 'http';

// living life on the edge with no TS
const JsonGraphqlServer = require('json-graphql-server').default;

async function main() {
  const server = await startTestServer();

  try {
    runArtsyTests();
  } finally {
    server.close();
  }
}

function startTestServer() {
  const app = express();
  app.use('/', JsonGraphqlServer(require('./db.js')));

  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(5050, (err) => {
      if (err) {
        return reject(err);
      }

      resolve(server);
    });
  });
}
main();

