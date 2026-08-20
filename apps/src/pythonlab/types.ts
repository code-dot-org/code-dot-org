export interface PyodidePathContent {
  id: number;
  name: string;
  mode: number;
  contents: Record<string, PyodidePathContent>;
}

export interface PyodideMessage {
  type: MessageType;
  // The message can be the return value of the Python script, or a
  // string message. The return value could be any object.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  id: string;
  // Only on 'theater_media' messages: the rendered gif as raw bytes. Structured
  // clone gives it a plain ArrayBuffer, which is what Blob accepts.
  gif?: Uint8Array<ArrayBuffer>;
  // Only on 'theater_media' messages, and only when the program made a sound:
  // the rendered audio track as raw WAV bytes.
  wav?: Uint8Array<ArrayBuffer>;
  // Only on 'theater_media' messages: how long the gif runs, in milliseconds.
  gifDurationMs?: number;
}

export type MessageType =
  | 'sysout'
  | 'syserr'
  | 'updated_source'
  | 'run_complete'
  | 'error'
  | 'internal_error'
  | 'system_error'
  | 'loading_pyodide'
  | 'loaded_pyodide'
  | 'load_failed'
  | 'loading_packages'
  | 'loaded_packages'
  | 'theater_media';

export interface PythonValidationResult {
  name: string;
  result: string;
}

export const AI_TUTOR_ANSWER_TYPES = [
  'ask',
  'buildPython',
  'buildCSV',
  'buildJSON',
  'debug',
  'documentation',
  'example',
  'explainCode',
  'hint',
  'pseudocode',
  'refusal',
  'refusalPythonSnippets',
  'testCase',
] as const;

export type AiTutorAnswerType = (typeof AI_TUTOR_ANSWER_TYPES)[number];
