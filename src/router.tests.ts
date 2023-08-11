import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Route, router } from '.';
import { matchEverything } from './matchers';
import { HttpStatus } from '../http/status';

jest.mock('../logger', () => ({
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

    describe('and access token in `Authorization` header', () => {
      it('should call handler with user', async () => {
        const route: Route = {
          matcher: matchEverything,
          handler: (_, user) => {


            return {
              statusCode: HttpStatus.OK,
              body: user
            };
          }
        };

        const expiredButValidAccessToken = 'eyJraWQiOiJ4b1wvK05iMWVlYlNoNWJXdkZRcVNwVVVYSjEwcVYxdmJaRDQ2dHRrMEJJRT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMDZhMTgzOS0yMzJmLTQxYjAtOTlkYy02NWQxNmQxMjBmMjYiLCJjb2duaXRvOmdyb3VwcyI6WyJBZG1pbmlzdHJhdG9ycyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfTWNmQnpVbU1lIiwiY2xpZW50X2lkIjoiNHVoZ2s1NnQ5OWxxbGcxNG9nOTJpN21pZDkiLCJvcmlnaW5fanRpIjoiMzBlYmEyYWMtMDRiYy00MWVjLThlOWUtNDkyYjdhOTVkZGYxIiwiZXZlbnRfaWQiOiIwMDk5MDJhYy02OWNlLTQ0NzItOGVjMC00ZGZmZjAyNDY5MTMiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjkxNDgwNDkwLCJleHAiOjE2OTE0ODQwOTAsImlhdCI6MTY5MTQ4MDQ5MCwianRpIjoiMDY2YmQ5M2ItZjIwZi00OWQ4LTgxOGUtZTQyZmMwYjAxMTBkIiwidXNlcm5hbWUiOiIxMDZhMTgzOS0yMzJmLTQxYjAtOTlkYy02NWQxNmQxMjBmMjYifQ.Gj7l_rRh0KIrL7Wx1uG86CInG2vDqclAcZ8CQ3BrrfhB_bHiwLjdLUcnVtwCWDkL9HZmU04XNSQBKEwDznRPwLzXH1XqsUutSvLm6psWFqilZeJ7GMZNCQ0922hcdlzNShyevQKlmp82Y7FxZBtcvqNFZt-id7VUkfJ46c6KQqzUaeKuLmC6asBNAdcJy9L7qTeBtMBj0N8Rso5JIqHbRULdmWcXZR-KuGGmBpD3qWAKT1JEd63-lG7AFJhDm0At-jvue3vP47SUyyZJ338WEEIeUQNVWsnei8DpIgW64cFxqM8BjG781zpz-mUJrIYuZ_JPg_H4a3SsqYyeZFZGAQ';
        const proxyEvent = {
          headers: {
            'Authorization': `Bearer ${expiredButValidAccessToken}`
          }
        } as unknown as APIGatewayProxyEventV2;
        const routeConfig = router([route]);

        const {body: user} = await routeConfig(proxyEvent) as Record<string, unknown>;
        expect(user).toBeTruthy();
      });
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
