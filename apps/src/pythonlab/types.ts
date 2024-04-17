export interface PyodidePathContent {
  id: number;
  name: string;
  mode: number;
  contents: Record<string, PyodidePathContent>;
}
