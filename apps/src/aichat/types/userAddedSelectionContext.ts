export interface UserAddedSelectionItem {
  sourceCode: string;
  filename: string;
  lineReference?: {start: number; end: number};
  displayName: string;
}

export type DisplayNameToUserAddedSelectionItem = {
  [key: string]: UserAddedSelectionItem;
};

export type UserAddedSelections = {
  messageText: string;
  items: UserAddedSelectionItem[];
};
