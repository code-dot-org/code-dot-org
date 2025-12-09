import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';

import category from './category';
import custom_category from './custom_category';
import whenRun from './when_run';

const blockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
  extendedOptions?: Partial<ExtendedBlock>;
}[] = [whenRun, category, custom_category];

export default blockDefinitions;
