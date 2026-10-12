/* Renders a component under the providers the lab mounts in index.tsx. */

import {ThemeProvider} from '@mui/material/styles';
import {render} from '@testing-library/react';
import {createElement, useEffect} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import train from '../../src/train';
import {
  TrainingDataProvider,
  useTrainingData,
} from '../../src/TrainingDataContext';

// Trains the way clicking Train model does, and hands back the model so a test
// can seed the context with it.
export function trainModel(store) {
  train.reset();
  train.init(store);
  return train.onClickTrain();
}

// Puts a model already trained outside React into the context, and keeps the
// latest context value reachable from the test.
const TrainingDataProbe = ({trainedModel, report}) => {
  const trainingData = useTrainingData();
  const {setTrainedModel} = trainingData;

  report(trainingData);

  useEffect(() => {
    if (trainedModel) {
      setTrainedModel(trainedModel);
    }
  }, [setTrainedModel, trainedModel]);

  return null;
};

export function renderWithProviders(element, {store, trainedModel} = {}) {
  let trainingData;
  const result = render(
    createElement(
      Provider,
      {store},
      createElement(
        TrainingDataProvider,
        null,
        createElement(TrainingDataProbe, {
          trainedModel,
          report: value => (trainingData = value),
        }),
        createElement(
          ThemeProvider,
          {theme: getMuiThemeForBrand(undefined)},
          element,
        ),
      ),
    ),
  );

  return {...result, trainingData: () => trainingData};
}
