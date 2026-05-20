import {ThemeProvider} from '@mui/material/styles';
import * as React from 'react';

import {Loading, ConfirmationDialog} from '@/oceans/components/common';
import Pond from '@/oceans/components/scenes/pond';
import Predict from '@/oceans/components/scenes/predict';
import Train from '@/oceans/components/scenes/train';
import Words from '@/oceans/components/scenes/words';

import {Modes} from './constants';
import {getState, setState} from './state';
import oceanTheme from './theme';

export default class UI extends React.Component {
  render() {
    const state = getState();
    const currentMode = getState().currentMode;
    const isLoading = (
      [Modes.Loading, Modes.IntermediateLoading] as number[]
    ).includes(currentMode as number);

    return (
      <ThemeProvider theme={oceanTheme}>
        <div>
          {isLoading && <Loading />}
          {currentMode === Modes.Words && <Words />}
          {currentMode === Modes.Training && <Train />}
          {currentMode === Modes.Predicting && <Predict />}
          {currentMode === Modes.Pond && <Pond />}
          {state.showConfirmationDialog && (
            <ConfirmationDialog
              onYesClick={state.confirmationDialogOnYes as () => void}
              onNoClick={() => setState({showConfirmationDialog: false})}
            />
          )}
        </div>
      </ThemeProvider>
    );
  }
}
