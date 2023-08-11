import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

interface Header
{
  [header: string]: boolean | number | string;
}

export interface RouteHandlerResult {
  statusCode?: number | undefined;
  headers?:
      | Header
      | undefined;
  body?: unknown | undefined;
  isBase64Encoded?: boolean | undefined;
  cookies?: string[] | undefined;
}

export type ApiGatewayProxyResult = Promise<APIGatewayProxyResultV2> | APIGatewayProxyResultV2;

export interface User {
  userId: string;
  groups: string[];
}

export type RouteHandler<TEnrichmentResult=unknown> = (event: APIGatewayProxyEventV2, enrichment?: TEnrichmentResult) => Promise<RouteHandlerResult>
  | RouteHandlerResult
  | string;
