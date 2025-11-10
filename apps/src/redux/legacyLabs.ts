// This is a subset of what's stored on `pageConstants` state
// to see a full list of pageConstants state, reference
// https://github.com/code-dot-org/code-dot-org/blob/9b394de6615920058336e2b4ddfea6b2e1591d28/apps/src/redux/pageConstants.js#L5
export interface LegacyLabsState {
  channelId?: string;
  serverLevelId?: number;
  serverScriptId?: number;
  appType?: string;
  isReadOnlyWorkspace?: boolean;
}
