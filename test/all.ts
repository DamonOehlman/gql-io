import { runArtsyTests } from './artsy';
import { runLocalTests } from './local';

async function main() {
  runLocalTests('http://localhost:9002/graphql');
  runArtsyTests();
}

main();

