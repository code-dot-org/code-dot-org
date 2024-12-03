import {LevelProperties} from '@cdo/apps/lab2/types';
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
  id: number;
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
  | 'loaded_pyodide';

export interface PythonlabLevelProperties extends LevelProperties {
  // An optional level property that determines whether to display the
  // 'Send to micro:bit' header button on pythonlab levels.
  enableMicroBit?: boolean;
}
