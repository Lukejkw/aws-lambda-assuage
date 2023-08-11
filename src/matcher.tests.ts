import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { HttpMethod } from './http';
import { matchEverything, methodMatcher } from './matchers';
import { randomInt } from 'crypto';

describe('matchEverything', () => {
  const randomPath = randomInt(0, 10).toString();
  const methods = Object.values(HttpMethod);
  const randomMethodIndex = randomInt(0, methods.length-1);
  const method = methods[randomMethodIndex];

  it(`given '${randomPath}' random method should match`, () => {
    const context = {
      requestContext: {
        http: {
          path: randomPath,
          method
        }
      }
    } as APIGatewayProxyEventV2;
    expect(matchEverything(context)).toBe(true);
  });
});

describe('methodMatcher', () => {
  const excludingWildCard = Object.values(HttpMethod)
    .filter(m => m !== HttpMethod.Any);

  for (const method of excludingWildCard) {
    it(`given '${method}' should match`, () => {
      const context = {
        requestContext: {
          http: {
            method
          }
        }
      } as APIGatewayProxyEventV2;

      expect(methodMatcher(method)(context)).toBe(true);
    });

    it(`given Any ('${HttpMethod.Any}') should match on ${method}`, () => {
      const context = {
        requestContext: {
          http: {
            method
          }
        }
      } as APIGatewayProxyEventV2;

      expect(methodMatcher(HttpMethod.Any)(context)).toBe(true);
    });
  }

  describe('given non matching method', () => {
    it('should not match', () => {
      const context = {
        requestContext: {
          http: {
            method: HttpMethod.Head
          }
        }
      } as APIGatewayProxyEventV2;

      expect(methodMatcher(HttpMethod.Get)(context)).toBe(false);
    });
  });
});
