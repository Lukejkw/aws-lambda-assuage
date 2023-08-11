import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { HttpMethod } from '../http/method';

export type Matcher = (proxyEvent: APIGatewayProxyEventV2) => boolean;

export const methodMatcher = (method: HttpMethod) => ({ requestContext }: APIGatewayProxyEventV2) =>
  method === HttpMethod.Any || requestContext.http.method === method;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const matchEverything = (_: APIGatewayProxyEventV2) => true;

export const composeMatchers = (matchers: Matcher[]) => (event: APIGatewayProxyEventV2) =>
  matchers.every(matcher => matcher(event));
