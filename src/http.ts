export enum HttpMethod {
    Post = 'POST',
    Get = 'GET',
    Head = 'HEAD',
    Options = 'OPTIONS',
    Put = 'PUT',
    Patch = 'PATCH',
    Delete = 'DELETE',
    Any = '*'
}

export enum HttpStatus {
  OK = 200,
  NotFound = 404,
  InternalServerError = 500
}
