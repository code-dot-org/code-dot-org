export interface BlockDefinition {
  category: string;
  config: BlockConfig;
  helperCode: string;
  name: string;
  pool: string;
}

export interface BlockConfig {
  args: arg[];
  blockText: string;
  color: [number, number, number];
  func: string;
  style: string;
}

export interface arg {
  customInput: string;
  name: string;
}
