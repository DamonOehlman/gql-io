import { query, DeserializationError } from '../';
import gql from 'graphql-tag';
import * as t from 'io-ts';
import tape from 'tape';
import { print } from 'graphql';

const POSTS_QUERY = gql`
query posts {
  allPosts {
    id
    title
  }
}
`;

export const PostsResponse = t.type({
  allPosts: t.array(t.type({
    id: t.string,
    title: t.string,
  })),
});

export const runLocalTests = (endpoint: string) => {
  tape('local posts query', async test => {
    test.plan(1);

    try {
      const response = await query({
        endpoint,
        query: POSTS_QUERY,
        docToStr: print,
        decoder: PostsResponse,
      });

      test.ok(response.allPosts.length >= 0, 'successfully retrieved posts');
    } catch (e) {
      test.fail(e);
    }
  });
};

