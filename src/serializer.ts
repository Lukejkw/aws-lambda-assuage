import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { RouteHandlerResult, ApiGatewayProxyResult } from './route-handler';

export const serialize = async (response: Promise<RouteHandlerResult> | RouteHandlerResult | string) => {
  const value = await response;

  const isString = typeof value === 'string';
  if (isString) {
    return value as string;
  }

  const bodyKey = 'body' as keyof typeof response;
  const body = value[bodyKey];

  if (!body) {
    // No body to serialize or body null
    return value as ApiGatewayProxyResult;
  }

  return {
    ...value,
    // We serialize the body into a JSON string
    body: JSON.stringify(body)
  } as APIGatewayProxyStructuredResultV2;
};
