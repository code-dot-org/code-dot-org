export interface UserAddedContextItem {
  sourceCode: string;
  filename: string;
  lineReference?: {start: number; end: number};
  displayName: string;
}

export type UserAddedContext = {[key: string]: UserAddedContextItem};
