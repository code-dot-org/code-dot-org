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
  // Present only on 'theater_media' messages: the rendered gif and optional
  // audio track as raw bytes.
  gif?: Uint8Array;
  audio?: Uint8Array | null;
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
