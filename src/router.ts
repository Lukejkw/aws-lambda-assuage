import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createLogger } from './logger';
import { HttpStatus } from './http';
import { Matcher } from './matchers';
import { serialize } from './serializer';
import { ApiGatewayProxyResult, RouteHandler } from './route-handler';

const logger = createLogger('routing');

const notFoundMessage = {
  message: 'Not Found'
};
const internalServerErrorMessage = {
  message: 'Unexpected error occurred'
};

type Enricher<TResult> = (event: APIGatewayProxyEventV2) => Promise<TResult> | TResult;

export interface Route<TEnrichmentResult=unknown> {
  priority?: number;
  matcher: Matcher;
  handler: RouteHandler;
  enricher?: Enricher<TEnrichmentResult>;
}

type Router = (routes: Route[]) => (event: APIGatewayProxyEventV2) =>
  ApiGatewayProxyResult;

const defaultRoutePriority = 100;

export const router: Router = routes => {
  // Perf: Prioritise once upfront on application bootstrap
  const prioritisedRoutes = routes.sort(
    (a, b) => (a.priority || defaultRoutePriority) - (b.priority || defaultRoutePriority));

  return async event => {
    const route = prioritisedRoutes.find(({ matcher }) => matcher(event));

    if (!route) {
      return serialize({
        statusCode: HttpStatus.NotFound,
        body: notFoundMessage
      });
    }

    try {
      const enrichment = route.enricher
        ? await route.enricher(event)
        : undefined;
      const response = route.handler(event, enrichment);
      return serialize(response);
    }
    catch (error: unknown) {
      logger.error('Handler Exception', error);

      return serialize({
        statusCode: HttpStatus.InternalServerError,
        body: internalServerErrorMessage
      });
    }
  };
};
