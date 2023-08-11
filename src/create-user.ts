import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Logger } from '../logger';
import jwtDecode from 'jwt-decode';
import { User } from './route-handler';

const authorisationHeader = 'Authorization';

interface AccessTokenPayload {
  sub: string;
  iss: string;
  version: number;
  client_id: string;
  origin_jti: string;
  token_use: string;
  scope: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  username: string;
  'cognito:groups': string[]
}

export const createUser = (logger: Logger, event: APIGatewayProxyEventV2) => {
  if (!event.headers) {
    return undefined;
  }

  const authorisationHeaderValue = event.headers[authorisationHeader];

  if (!authorisationHeaderValue) {
    return undefined;
  }

  const match = authorisationHeaderValue.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    logger.warn('Unable to extra access token. Token must be in format \'Bearer [ACCESS_TOKEN]\'');
    return undefined;
  }

  const accessToken = match[1];

  // Security Note!
  // We are not validating the token here - just decoding it.
  // We assume that the token has already been validated by the time we get here

  const decoded: AccessTokenPayload = jwtDecode(accessToken);

  const user: User = {
    userId: decoded.sub,
    groups: decoded['cognito:groups']
  };
  return user;
};
