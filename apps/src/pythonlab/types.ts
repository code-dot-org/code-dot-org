export interface PyodidePathContent {
  id: number;
  name: string;
  mode: number;
  contents: Record<string, PyodidePathContent>;
}

export interface PyodideMessage {
  type: string;
  message: string;
  id: string;
}
