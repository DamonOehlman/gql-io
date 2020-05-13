import { query } from '../';
import gql from 'graphql-tag';
import * as t from 'io-ts';
import tape from 'tape';

const COLLECTIONS_QUERY = gql`
query collections {
  marketingHubCollections {
    id
    title
  }
}
`;

export const HubQueryResponse = t.type({
  marketingHubCollections: t.array(t.type({
    id: t.string,
    title: t.string,
  })),
});

tape('artsy graphql endpoints (string query)', async test => {
  test.plan(1);

  try {
    const response = await query({
      endpoint: 'https://metaphysics-production.artsy.net/',
      query: `
        query collections {
          marketingHubCollections {
            id
            title
          }
        }
      `,
      decoder: HubQueryResponse,
    });

    test.ok(response.marketingHubCollections.length >= 0, 'successfully retrieved a collection from artsy');
  } catch (e) {
    test.fail(e);
  }
});

tape('artsy graphql endpoints (DocumentNode query)', async test => {
  test.plan(1);

  try {
    const response = await query({
      endpoint: 'https://metaphysics-production.artsy.net/',
      query: COLLECTIONS_QUERY,
      decoder: HubQueryResponse,
    });

    test.ok(response.marketingHubCollections.length >= 0, 'successfully retrieved a collection from artsy');
  } catch (e) {
    test.fail(e);
  }
});
