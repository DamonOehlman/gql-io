import type { Decoder, Errors } from 'io-ts';
import type { DocumentNode } from 'graphql';
import bent, { Json } from 'bent';

type ClientHeaders = { [key: string]: string };
type QueryVariables = { [key: string]: string | number | boolean | null };

interface CoreOptions {
  endpoint: string;
  docToStr?: (node: DocumentNode) => string;
}

export interface ClientOptions extends CoreOptions {
  defaultHeaders?: ClientHeaders;
}

interface RequestOptions<O> extends CoreOptions {
  query: DocumentNode | string;
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

export class DeserializationError extends Error {
  constructor(public readonly errors: Errors) {
    super('Unable to deserialize graphql response');

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DeserializationError);
    }

    this.name = 'DeserializationError';
  }
}

export const createClient = (options: ClientOptions) => {
  const { endpoint, defaultHeaders, docToStr } = options;

  const createWrapper = <O>(handler: RequestHandler<O>) => (options: WrappedRequestOptions<O>) => handler({
    endpoint,
    docToStr: options.docToStr || docToStr,
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
  const { endpoint, query, docToStr } = options;
  const post = bent('POST', 'json', 200);

  let queryText: string;
  if (typeof query === 'string') {
    queryText = query;
  } else {
    if (!docToStr) {
      throw new Error('Have been provided a DocumentNode but no way to convert it, please provide the docToStr option');
    }

    queryText = docToStr(query);
  }

  const body: RequestPayload = {
    query: queryText,
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
  if (result._tag === 'Right') {
    return result.right;
  }

  throw new DeserializationError(result.left);
};

export const mutate = <O>(options: RequestOptions<O>) => query(options);
