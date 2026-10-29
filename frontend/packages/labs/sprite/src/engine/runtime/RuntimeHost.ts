/**
 * What the runtime tells the page it runs in. Apps dispatched these to its
 * Redux store or called apps modules directly; the engine implements them.
 */

/** Apps' `workspaceAlertTypes`. */
export type WorkspaceAlertType = 'error' | 'warning' | 'notification';

export interface ConsoleMessage {
  name?: string;
  text: unknown;
}

export interface SpeechRequest {
  text: string;
  gender: string;
  language: string;
}

export interface RuntimeHost {
  /** Apps' `displayWorkspaceAlert`: a message over the workspace. */
  displayWorkspaceAlert(
    type: WorkspaceAlertType,
    message: string,
    bottom: boolean,
  ): void;
  /** Apps' `addTextPrompt`: ask the student to type an answer. */
  addTextPrompt(promptText: string, variableName: string): void;
  /** Apps' `addMultipleChoicePrompt`: ask the student to pick a choice. */
  addMultipleChoicePrompt(
    promptText: string,
    variableName: string,
    choices: unknown[],
  ): void;
  /** Apps' `addConsoleMessage`: a line in the text console. */
  addConsoleMessage(message: ConsoleMessage): void;
  /** Apps' `audioApi.playSpeech`: text to speech. */
  playSpeech(request: SpeechRequest): void;
  /**
   * The generated-code names of the main workspace's variables, as apps
   * read them from `Blockly.getMainWorkspace()` and `Blockly.JavaScript`.
   */
  getVariableNames(): string[];
}

/** A host that ignores everything, for tests and headless runs. */
export const NO_OP_HOST: RuntimeHost = {
  displayWorkspaceAlert: () => {},
  addTextPrompt: () => {},
  addMultipleChoicePrompt: () => {},
  addConsoleMessage: () => {},
  playSpeech: () => {},
  getVariableNames: () => [],
};
