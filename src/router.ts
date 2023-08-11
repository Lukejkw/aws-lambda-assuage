import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createLogger } from './logger';
import { HttpStatus } from './http/status';
import { Matcher } from './matchers';
import { serialize } from './serializer';
import { ApiGatewayProxyResult, RouteHandler } from './route-handler';
import { createUser } from './create-user';

const logger = createLogger('routing');

const notFoundMessage = {
  message: 'Not Found'
};
const internalServerErrorMessage = {
  message: 'Unexpected error occurred'
};

export interface Route {
  priority?: number;
  matcher: Matcher;
  handler: RouteHandler;
}

type Router = (routes: Route[]) => (event: APIGatewayProxyEventV2) =>
  ApiGatewayProxyResult;

const defaultRoutePriority = 100;

export const router: Router = routes => {
  // Perf: Prioritise once upfront on application bootstrap
  const prioritisedRoutes = routes.sort(
    (a, b) => (a.priority || defaultRoutePriority) - (b.priority || defaultRoutePriority));

  return event => {
    const route = prioritisedRoutes.find(({ matcher }) => matcher(event));

    if (!route) {
      return serialize({
        statusCode: HttpStatus.NotFound,
        body: notFoundMessage
      });
    }

    try {
      const user = createUser(logger, event);
      const response = route.handler(event, user);
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
