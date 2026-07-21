import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import goToExternalScene from './goToExternalScene';
import goToScene from './goToScene';

// Scenes UI variant blocks, defined client-side (not in the DB block pool)
// because their dropdown options are the project's scenes, which only this
// lab knows.
const sceneBlockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
}[] = [goToScene, goToExternalScene];

export default sceneBlockDefinitions;
