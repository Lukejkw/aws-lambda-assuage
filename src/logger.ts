export interface Logger {
  info: (message: string, object?: unknown) => void;
  error: (message: string, error: unknown) => void;
  log: (message: string, object?: unknown) => void;
  warn: (message: string) => void;
}

export const createLogger: (scope: string) => Logger = (scope: string) => ({
  info: (message: string, object?: unknown) =>
    console.info(`${scope}: ${message}`, object),
  error: (message: string, error: unknown) =>
    console.error(`${scope}: ${message}`, error),
  log: (message: string, object?: unknown) =>
    console.log(`${scope}: ${message}`, object),
  warn: (message: string) => console.warn(`${scope}: ${message}`)
});
