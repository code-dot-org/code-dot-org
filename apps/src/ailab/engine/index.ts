import {setInstructionsDismissed} from './redux';
import {store} from './store';

export const instructionsDismissed = function (): void {
  store.dispatch(setInstructionsDismissed());
};

export {default as AilabEngine} from './AilabEngine';
export type {AilabEngineProps} from './AilabEngine';

export {store} from './store';
export {loadLevel} from './levelLoad';
export {ProjectProvider} from './ProjectContext';
export {TrainingDataProvider} from './TrainingDataContext';

export {defaultProject} from './types';
export {isValidHyperparameter} from './helpers/utils';
export type {AilabProject, HistoricResult, Hyperparameters} from './types';

export type {
  InstructionsKey,
  Metadata,
  Mode,
  ModelDataToSave,
  SaveResponse,
} from './types';
export {INSTRUCTIONS_KEYS} from './types';
export {selectableColumns} from './helpers/columnDetails';
export type {Lab2Instructions} from './lab2Instructions';
export {LAB2_INSTRUCTIONS} from './lab2Instructions';
export type {Dataset} from './datasetManifest';
export {
  getAvailableDatasets,
  getDatasets,
  getRawDatasets,
} from './datasetManifest';
