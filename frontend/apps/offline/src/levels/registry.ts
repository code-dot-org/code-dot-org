export interface LevelProps<T extends object = object> {
  levelData?: T;
}

export interface LevelModule {
  name: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: (config: {[key: string]: any}) => {[key: string]: any};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: React.FunctionComponent<LevelProps<any>>;
}

export interface LevelRegistry {
  [key: string]: LevelModule;
}

const levelRegistry: LevelRegistry = {};

/**
 * Keeps track of the different level types in our level registry.
 */
export function register(levelModule: LevelModule) {
  levelRegistry[levelModule.key] = levelModule;
}

export default levelRegistry;
