import { runArtsyTests } from './artsy';
import { runLocalTests } from './local';
import type { Server } from 'http';
import { ApolloServer, gql } from 'apollo-server';
import { typeDefs } from './data/schema';

const PORT = 5050;

async function main() {
  const { url, server } = await startTestServer();
  console.log(`mock server running @ ${url}, starting tests`);

  try {
    runLocalTests(url);
    // runArtsyTests();
  } finally {
    await server.close();
  }
}

async function startTestServer() {
  const server = new ApolloServer({
    typeDefs,
    mocks: true,
  });

  return server.listen({ port: PORT });
}

main();

