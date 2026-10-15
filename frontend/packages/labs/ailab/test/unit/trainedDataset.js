import fs from 'fs';
import path from 'path';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {parseCSV} from '../../src/csvReaderWrapper';
import {traceDisplayTree} from '../../src/helpers/displayTreeTrace';
import {getKeyByValue} from '../../src/helpers/utils';
import {convertValueForTraining} from '../../src/helpers/valueConversion';
import {
  resetState,
  setColumnsByDataType,
  setImportedMetadata,
  setMode,
  setReserveLocation,
  setSelectedCSV,
  setSelectedJSON,
} from '../../src/redux';
import {getDisplayTree} from '../../src/selectors/visualizationSelectors';
import {store} from '../../src/store';
import train from '../../src/train';
import {initialProject} from '../../src/types';

import {projectFromRun} from './renderWithProviders';

const DIR = path.join(__dirname, '../../public/datasets');

export function trainDataset(
  id,
  {
    label,
    features,
    mode = {trainer: 'decisionTree'},
    reserveLocation = TestDataLocations.END,
  } = {},
) {
  const csv = fs.readFileSync(path.join(DIR, `${id}.csv`), 'utf8');
  const metadata = JSON.parse(
    fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'),
  );

  store.dispatch(resetState());
  train.reset();
  store.dispatch(setMode(mode));
  store.dispatch(setSelectedCSV(`${id}.csv`));
  store.dispatch(setSelectedJSON(`${id}.json`));
  parseCSV(csv, false, false);
  store.dispatch(setImportedMetadata(metadata));
  metadata.fields.forEach(field =>
    store.dispatch(
      setColumnsByDataType(field.id, field.type || ColumnTypes.CATEGORICAL),
    ),
  );
  store.dispatch(setReserveLocation(reserveLocation));
  const labelColumn = label || metadata.defaultLabelColumn;
  const project = {
    ...initialProject,
    labelColumn,
    selectedFeatures:
      features ||
      Object.keys(store.getState().data[0]).filter(
        column => column !== labelColumn,
      ),
  };

  train.init(store, project);
  const run = train.onClickTrain();
  return {
    state: store.getState(),
    project: projectFromRun(project, run),
    trainedModel: run?.trainedModel,
    run,
  };
}

export function modelInputs(state, project) {
  return state.data.map(row =>
    project.selectedFeatures.map(feature =>
      convertValueForTraining(state, project, row[feature], feature),
    ),
  );
}

export function modelPredictions(state, project, trainedModel) {
  const labelKey = state.featureNumberKey[project.labelColumn];
  return trainedModel
    .predict(modelInputs(state, project))
    .map(prediction =>
      labelKey ? getKeyByValue(labelKey, prediction) : prediction,
    );
}

export function rowTraces(state, project, trainedModel) {
  const tree = getDisplayTree(state, project, trainedModel);
  const {root} = trainedModel.toJSON();
  const inputs = modelInputs(state, project);
  return state.data.map((row, index) =>
    traceDisplayTree(tree, root, inputs[index], row),
  );
}
