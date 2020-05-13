import { Decoder } from 'io-ts';
import bent, { Json } from 'bent';
import { isRight } from 'fp-ts/lib/Either';
import { DocumentNode, print } from 'graphql';

type ClientHeaders = { [key: string]: string };
type QueryVariables = { [key: string]: string | number | boolean | null };

export interface ClientOptions {
  endpoint: string;
  defaultHeaders?: ClientHeaders;
}

interface RequestOptions<O> {
  query: DocumentNode | string;
  endpoint: string;
  decoder: Decoder<Json, O>;
  variables?: QueryVariables;
  headers?: ClientHeaders;
}

type RequestHandler<O> = (options: RequestOptions<O>) => Promise<O>;
type WrappedRequestOptions<O> = Omit<RequestOptions<O>, 'endpoint'>;

interface RequestPayload {
  query: string;
  variables?: QueryVariables;
}

export const createClient = (options: ClientOptions) => {
  const { endpoint, defaultHeaders } = options;

  const createWrapper = <O>(handler: RequestHandler<O>) => (options: WrappedRequestOptions<O>) => handler({
    endpoint,
    query: options.query,
    decoder: options.decoder,
    variables: options.variables,
    headers: {
      ...defaultHeaders || {},
      ...options.headers || {},
    },
  });

  return {
    query: createWrapper(query),
    mutate: createWrapper(mutate),
  };
};

export const query = async <O>(options: RequestOptions<O>): Promise<O> => {
  const { endpoint, query } = options;
  const post = bent('POST', 'json', 200);
  const body: RequestPayload = {
    query: typeof query === 'string' ? query : print(query),
  };

  // TODO: operation name
  if (options.variables) {
    body.variables = options.variables;
  }

  const response = await post(endpoint, body, {
    'Content-Type': 'application/json'
  });

  // TODO: get bent to be more useful here, or actually deserialize the data from the response
  const data = (response as any).data;
  const result = options.decoder.decode(data);
  if (isRight(result)) {
    return result.right;
  }

  throw new Error(`Unable to deserialize graphql response`);
};

export const mutate = <O>(options: RequestOptions<O>) => query(options);
