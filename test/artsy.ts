import { query, DeserializationError } from '../';
import gql from 'graphql-tag';
import * as t from 'io-ts';
import tape from 'tape';
import { print } from 'graphql';

const COLLECTIONS_QUERY = gql`
query collections {
  marketingHubCollections {
    id
    title
  }
}
`;

const PARAMETERIZED_QUERY = gql`
query getArtworkById($id: String!) {
	artwork(id: $id) {
    id
    title
  }
}
`

export const HubQueryResponse = t.type({
  marketingHubCollections: t.array(t.type({
    id: t.string,
    title: t.string,
  })),
});

export const ArtworkResponse = t.type({
  artwork: t.type({
    id: t.string,
    title: t.string,
  }),
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
      docToStr: print,
    });

    test.ok(response.marketingHubCollections.length >= 0, 'successfully retrieved a collection from artsy');
  } catch (e) {
    test.fail(e);
  }
});

tape('artsy graphql endpoints (DocumentNode query, parameterized)', async test => {
  const artworkId = 'alex-katz-four-poplars-study-2';
  test.plan(1);

  try {
    const response = await query({
      endpoint: 'https://metaphysics-production.artsy.net/',
      query: PARAMETERIZED_QUERY,
      variables: {
        id: artworkId,
      },
      decoder: ArtworkResponse,
      docToStr: print,
    });

    test.equal(response.artwork.id, artworkId, 'got matching artwork');
  } catch (e) {
    test.fail(e);
  }
});
