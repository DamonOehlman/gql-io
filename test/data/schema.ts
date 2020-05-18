import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    message: String!
  }
`;
