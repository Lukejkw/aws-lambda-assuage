import { APIGatewayProxyEventPathParameters, APIGatewayProxyEventV2 } from 'aws-lambda';

export const pathParameterExtractor = (propertyKey: keyof APIGatewayProxyEventPathParameters) => (event: APIGatewayProxyEventV2) => {
  if (!event.pathParameters) {
    return undefined;
  }

  return event.pathParameters[propertyKey];
};
