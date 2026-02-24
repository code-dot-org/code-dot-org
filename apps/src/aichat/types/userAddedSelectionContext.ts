export interface UserAddedSelectionContextItem {
  sourceCode: string;
  filename: string;
  lineReference?: {start: number; end: number};
  displayName: string;
}

export type UserAddedSelectionContext = {
  [key: string]: UserAddedSelectionContextItem;
};
