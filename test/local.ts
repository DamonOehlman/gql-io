import { query, DeserializationError } from '../';
import gql from 'graphql-tag';
import * as t from 'io-ts';
import tape from 'tape';
import { print } from 'graphql';

const PEOPLE_QUERY = gql`
query {
  people {
    name
  }
}
`;

export const PeopleResponse = t.type({
  people: t.array(t.type({
    name: t.string,
  })),
});

export const runLocalTests = (endpoint: string) => {
  tape('local posts query', async test => {
    test.plan(1);

    try {
      const response = await query({
        endpoint,
        query: PEOPLE_QUERY,
        docToStr: print,
        decoder: PeopleResponse,
      });

      test.ok(response.people.length >= 0, 'successfully retrieved people');
    } catch (e) {
      test.fail(e);
    }
  });
};

