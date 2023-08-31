import { router, HttpMethod, methodMatcher, matchEverything } from 'aws-lambda-assuage';

export const handler = router([
  {
    matcher: methodMatcher(HttpMethod.Get),
    handler: (event) => {
      console.log('API Gateway Event:', event)

      return {
        statusCode: 200,
        body: 'Hello World!'
      };
    }
  }
]);