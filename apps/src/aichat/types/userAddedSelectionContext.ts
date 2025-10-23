export interface UserAddedSelectionItem {
  sourceCode: string;
  filename: string;
  lineReference?: {start: number; end: number};
  displayName: string;
}

export type DisplayNameToUserAddedSelection = {
  [key: string]: UserAddedSelectionItem;
};
