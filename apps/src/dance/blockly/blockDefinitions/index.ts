import category from '@cdo/apps/blockly/blockDefinitions/category';
import custom_category from '@cdo/apps/blockly/blockDefinitions/custom_category';
import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';

import whenRun from './when_run';

const blockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
  extendedOptions?: Partial<ExtendedBlock>;
}[] = [whenRun, category, custom_category];

export default blockDefinitions;
