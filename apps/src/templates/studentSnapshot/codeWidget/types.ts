export interface CodeWidgetLevelInfo {
  instructions: string;
}

// Sentinel selectedFileId value used to show the InstructionsPane instead of
// a file's contents, reusing the existing selectedFileId/onFileSelect wiring.
export const INSTRUCTIONS_TAB_ID = '__instructions__';
