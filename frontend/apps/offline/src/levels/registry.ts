import artistLoader from '@code-dot-org/lab-artist/parser';
import frequencyAnalysisLoader from '@code-dot-org/lab-frequency-analysis/parser';
import karelLoader from '@code-dot-org/lab-karel/parser';
import mazeLoader from '@code-dot-org/lab-maze/parser';

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

export interface LevelRegistry2 {
  [key: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    load: (config: {[key: string]: any}, xml?: Document, parser?: DOMParser) => {[key: string]: any};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    levelModule?: () => any;
  };
}

const levelRegistry: LevelRegistry = {};
const levelRegistry2: LevelRegistry2 = {};

/**
 * Keeps track of the different level types in our level registry.
 */
export function register(levelModule: LevelModule) {
  levelRegistry[levelModule.key] = levelModule;
}

export default levelRegistry;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function register2(key: string, load: (config: {[key: string]: any}, xml?: Document, parser?: DOMParser) => {[key: string]: any}, levelModule?: () => any) {
  levelRegistry2[key] = {
    load,
    levelModule,
  };
}

export {levelRegistry2};

register2('Maze', mazeLoader);
register2('FrequencyAnalysis', frequencyAnalysisLoader);
register2('Artist', artistLoader);
register2('Karel', karelLoader);
