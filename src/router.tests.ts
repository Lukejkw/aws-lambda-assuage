import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Route, router } from '.';
import { matchEverything } from './matchers';
import { HttpStatus } from './http';

jest.mock('./logger', () => ({
  createLogger: () => ({
    error: jest.fn()
  })
}));

describe('router', () => {
  describe('given multiple matching route', () => {
    it('should match on higher priority route', async () => {
      const expectedResponse = 'High priority';
      const lowPriorityRoute: Route = {
        priority: 2,
        matcher: matchEverything,
        handler: () => {
          return 'Low priority';
        }
      };

      const highPriorityRoute: Route = {
        priority: 1,
        matcher: matchEverything,
        handler: () => {
          return expectedResponse;
        }
      };
      const proxyEvent = {} as APIGatewayProxyEventV2;
      const routeConfig = router([lowPriorityRoute, highPriorityRoute]);

      const response = await routeConfig(proxyEvent);

      expect(response).toBe(expectedResponse);
    });

    it('with one as default should match on higher priority route', async () => {
      const expectedResponse = 'High priority';
      const lowPriorityRoute: Route = {
        priority: undefined, // Intentionally undefined
        matcher: matchEverything,
        handler: () => {
          return 'Low priority';
        }
      };

      const moderatePriorityRoute: Route = {
        priority: 2,
        matcher: matchEverything,
        handler: () => {
          return 'Moderate priority';
        }
      };

      const highPriorityRoute: Route = {
        priority: 1,
        matcher: matchEverything,
        handler: () => {
          return expectedResponse;
        }
      };
      const proxyEvent = {} as APIGatewayProxyEventV2;
      const routeConfig = router([moderatePriorityRoute, lowPriorityRoute, highPriorityRoute]);

      const response = await routeConfig(proxyEvent);

      expect(response).toBe(expectedResponse);
    });
  });

  describe('given matching route', () => {
    it('should produce response from handler', async () => {
      const expectedResponse = 'response';
      const route: Route = {
        matcher: matchEverything,
        handler: () => {
          return expectedResponse;
        }
      };
      const proxyEvent = {} as APIGatewayProxyEventV2;
      const routeConfig = router([route]);

      const response = await routeConfig(proxyEvent);

      expect(response).toBe(expectedResponse);
    });

    it('and object body > should serialize body from handler', async () => {
      const body = {a: 1};
      const expectedResponse = {
        statusCode: HttpStatus.OK,
        body: body
      };
      const route: Route = {
        matcher: matchEverything,
        handler: () => {
          return expectedResponse;
        }
      };
      const proxyEvent = {} as APIGatewayProxyEventV2;
      const routeConfig = router([route]);

      const response = await routeConfig(proxyEvent) as Record<string, unknown>;

      expect(response['body']).toBe(JSON.stringify(body));
    });
  });

  describe('given non-matching route', () => {
    it('should produce 404 response', async () => {
      const route: Route = {
        matcher: () => false,
        handler: () => {
          throw new Error('Handler should not be called!');
        }
      };
      const proxyEvent = {} as APIGatewayProxyEventV2;
      const routeConfig = router([route]);

      const response = (await routeConfig(proxyEvent)) as APIGatewayProxyStructuredResultV2;

      expect(response.statusCode).toBe(HttpStatus.NotFound);
    });
  });

  describe('matching route which throws error', () => {
    it('should produce internal server error response', async () => {
      const error = new Error('A totally expected and internal error occured.');
      const route: Route = {
        matcher: matchEverything,
        handler: () => {
          throw error;
        }
      };
      const proxyEvent = {} as APIGatewayProxyEventV2;
      const routeConfig = router([route]);

      const response = (await routeConfig(proxyEvent)) as APIGatewayProxyStructuredResultV2;

      expect(response.statusCode).toBe(HttpStatus.InternalServerError);
    });
  });
});
