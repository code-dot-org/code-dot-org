// Constants shared with the Javabuilder backend (see
// https://github.com/code-dot-org/javabuilder). These names must not be
// changed without coordinating a release on the Java side.

export enum CsaViewMode {
  NEIGHBORHOOD = 'neighborhood',
  CONSOLE = 'console',
  THEATER = 'theater',
}

export enum WebSocketMessageType {
  NEIGHBORHOOD = 'NEIGHBORHOOD',
  THEATER = 'THEATER',
  SYSTEM_OUT = 'SYSTEM_OUT',
  EXCEPTION = 'EXCEPTION',
  DEBUG = 'DEBUG',
  STATUS = 'STATUS',
  TEST_RESULT = 'TEST_RESULT',
  AUTHORIZER = 'AUTHORIZER',
  CONNECTED = 'CONNECTED',
}

export enum StatusMessageType {
  COMPILING = 'COMPILING',
  COMPILATION_SUCCESSFUL = 'COMPILATION_SUCCESSFUL',
  RUNNING = 'RUNNING',
  GENERATING_RESULTS = 'GENERATING_RESULTS',
  GENERATING_PROGRESS = 'GENERATING_PROGRESS',
  SENDING_VIDEO = 'SENDING_VIDEO',
  TIMEOUT_WARNING = 'TIMEOUT_WARNING',
  TIMEOUT = 'TIMEOUT',
  EXITED = 'EXITED',
  RUNNING_VALIDATION = 'RUNNING_VALIDATION',
  RUNNING_PROJECT_TESTS = 'RUNNING_PROJECT_TESTS',
  NO_TESTS_FOUND = 'NO_TESTS_FOUND',
}

export enum InputMessageType {
  SYSTEM_IN = 'SYSTEM_IN',
  THEATER = 'THEATER',
}

export enum ExecutionType {
  RUN = 'RUN',
  TEST = 'TEST',
}

export enum AuthorizerSignalType {
  TOKEN_USED = 'TOKEN_USED',
  NEAR_LIMIT = 'NEAR_LIMIT',
  USER_BLOCKED = 'USER_BLOCKED',
  CLASSROOM_BLOCKED = 'CLASSROOM_BLOCKED',
  USER_BLOCKED_TEMPORARY = 'USER_BLOCKED_TEMPORARY',
}

export const STATUS_MESSAGE_PREFIX = '[JAVALAB]';

// Wire-level message shape from Javabuilder. Carrying the union of all
// detail payloads as `unknown` here keeps the WebSocket boundary loose;
// downstream handlers narrow on `type` before reading `detail`.
export interface JavabuilderMessage {
  type: WebSocketMessageType;
  value?: string;
  detail?: unknown;
}
