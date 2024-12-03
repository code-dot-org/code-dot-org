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
  /**
   * Initial AI chat customizations set by the level.
   * For each field, levelbuilders may define the initial default value,
   * and visibility (hidden, readonly, or editable).
   * Visibility is not editable by the student; students can only change
   * the value if it is set to editable.
   */
  enableMicroBit?: boolean;
}
