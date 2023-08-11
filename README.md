# AWS Lambda Assuage

[![Build and Test](https://github.com/Lukejkw/aws-lambda-assuage/actions/workflows/ci.yml/badge.svg)](https://github.com/Lukejkw/aws-lambda-assuage/actions/workflows/ci.yml)

A super simple lightweight extensible router to take the AWS Lambda routing pain away from API Gateway.

## Features

 - Simple to use
 - Extensible
 - Tiny
 - Includes TypeScript types

## Getting Started

Just import the router and define your routes as objects. You can add as many routes as you need.

The following would match on all `GET` requests:

```ts
import { router, HttpMethod, methodMatcher } from 'aws-lambda-assuage';

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

```

> Tip: Use the `priority` field if you have multiple routes which might match

### Matchers

Matchers are simple functions which determine if the route should *match* on the incoming event. There are a couple built in matchers, but it's super easy to build your own.

Built in matchers:
 - `methodMatcher` - matches on a given method
 - `matchEverything` - matchers everything
 - `composeMatchers` - higher order function for composing matchers together

#### Custom Matcher Example:

```ts
export const catMatch = (method: HttpMethod) => ({ requestContext }: APIGatewayProxyEventV2) =>
  requestContext.http.path === 'cat';
```

## Enrichers

Need to run something before your handler fires? Enrichers run before your route and are added as the second parameter to the handler.

Simply add it to the route using the `enricher`.

```ts
import { router, HttpMethod, methodMatcher } from 'aws-lambda-assuage';

export const handler = router([
  {
    matcher: methodMatcher(HttpMethod.Get),
    enricher: e => 'LASER DRAGON', // Can be any type you want
    handler: (event, extra) => {
      console.log('API Gateway Event:', event)
      console.log('Enriched Content:', extra)
      return {
        statusCode: 200,
        body: `Hello, ${extra}!` // Produces 'Hello LASER DRAGON'
      };
    }
  }
]);
```

## Contributing

Submit an issue before contributing please.