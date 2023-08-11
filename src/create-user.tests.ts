import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Logger } from '../logger';
import { createUser } from './create-user';

const expiredButValidAccessToken = 'eyJraWQiOiJ4b1wvK05iMWVlYlNoNWJXdkZRcVNwVVVYSjEwcVYxdmJaRDQ2dHRrMEJJRT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMDZhMTgzOS0yMzJmLTQxYjAtOTlkYy02NWQxNmQxMjBmMjYiLCJjb2duaXRvOmdyb3VwcyI6WyJBZG1pbmlzdHJhdG9ycyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfTWNmQnpVbU1lIiwiY2xpZW50X2lkIjoiNHVoZ2s1NnQ5OWxxbGcxNG9nOTJpN21pZDkiLCJvcmlnaW5fanRpIjoiMzBlYmEyYWMtMDRiYy00MWVjLThlOWUtNDkyYjdhOTVkZGYxIiwiZXZlbnRfaWQiOiIwMDk5MDJhYy02OWNlLTQ0NzItOGVjMC00ZGZmZjAyNDY5MTMiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjkxNDgwNDkwLCJleHAiOjE2OTE0ODQwOTAsImlhdCI6MTY5MTQ4MDQ5MCwianRpIjoiMDY2YmQ5M2ItZjIwZi00OWQ4LTgxOGUtZTQyZmMwYjAxMTBkIiwidXNlcm5hbWUiOiIxMDZhMTgzOS0yMzJmLTQxYjAtOTlkYy02NWQxNmQxMjBmMjYifQ.Gj7l_rRh0KIrL7Wx1uG86CInG2vDqclAcZ8CQ3BrrfhB_bHiwLjdLUcnVtwCWDkL9HZmU04XNSQBKEwDznRPwLzXH1XqsUutSvLm6psWFqilZeJ7GMZNCQ0922hcdlzNShyevQKlmp82Y7FxZBtcvqNFZt-id7VUkfJ46c6KQqzUaeKuLmC6asBNAdcJy9L7qTeBtMBj0N8Rso5JIqHbRULdmWcXZR-KuGGmBpD3qWAKT1JEd63-lG7AFJhDm0At-jvue3vP47SUyyZJ338WEEIeUQNVWsnei8DpIgW64cFxqM8BjG781zpz-mUJrIYuZ_JPg_H4a3SsqYyeZFZGAQ';

describe('createUser', () => {
  describe('given valid access token', () => {
    it('should produce user', () => {
      const logger = {
        warn: jest.fn()
      } as unknown as Logger;

      expect(createUser(logger, {
        headers: {
          'Authorization': `Bearer ${expiredButValidAccessToken}`
        }
      } as unknown as APIGatewayProxyEventV2)).toEqual({
        userId: '106a1839-232f-41b0-99dc-65d16d120f26',
        groups: [
          'Administrators'
        ],
      });
    });
  });

  describe('given no headers', () => {
    it('should produce undefined', () => {
      const logger = {
        warn: jest.fn()
      } as unknown as Logger;

      expect(createUser(logger, {} as unknown as APIGatewayProxyEventV2))
        .toBe(undefined);
    });
  });

  describe('given no `Authorization` header', () => {
    it('should produce undefined', () => {
      const logger = {
        warn: jest.fn()
      } as unknown as Logger;

      expect(createUser(logger, {
        headers: {
          // No headers to be seen...
        }
      } as unknown as APIGatewayProxyEventV2)).toBe(undefined);
    });
  });

  describe('given `Authorization` header with incorrect format', () => {
    it('should produce undefined', () => {
      const logger = {
        warn: jest.fn()
      } as unknown as Logger;

      expect(createUser(logger, {
        headers: {
          'Authorization': `${expiredButValidAccessToken}`
        }
      } as unknown as APIGatewayProxyEventV2)).toBe(undefined);
    });
  });
});
