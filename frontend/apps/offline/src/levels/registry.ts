export interface LevelModule {
  name: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: (config: {[key: string]: any}) => {[key: string]: any};
  default: React.FunctionComponent<T>;
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
