export interface UserAddedSelectionContextItem {
  sourceCode: string;
  filename: string;
  lineReference?: {start: number; end: number};
  displayName: string;
  uuid_filename?: boolean;
}

export type UserAddedSelectionContext = {
  [key: string]: UserAddedSelectionContextItem;
};
