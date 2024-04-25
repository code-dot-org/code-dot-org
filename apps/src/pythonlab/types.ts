export interface PyodidePathContent {
  id: number;
  name: string;
  mode: number;
  contents: Record<string, PyodidePathContent>;
}

export interface PyodideMessage {
  type: 'sysout' | 'syserr' | 'updated_source' | 'run_complete' | 'error';
  message: string;
  id: string;
}
