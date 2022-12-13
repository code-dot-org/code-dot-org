import React from 'react';

import {getState, setState} from './state';
import {Modes} from './constants';

import {Loading, ConfirmationDialog} from '@ml/oceans/components/common'
import Words from "@ml/oceans/components/scenes/words";
import Train from "@ml/oceans/components/scenes/train";
import Predict from "@ml/oceans/components/scenes/predict";
import Pond from "@ml/oceans/components/scenes/pond";


export default class UI extends React.Component {
  render() {
    const state = getState();
    const currentMode = getState().currentMode;
    const isLoading = [Modes.Loading, Modes.IntermediateLoading].includes(
      currentMode
    );

    return (
      <div>
        {isLoading && <Loading />}
        {currentMode === Modes.Words && <Words />}
        {currentMode === Modes.Training && <Train />}
        {currentMode === Modes.Predicting && <Predict />}
        {currentMode === Modes.Pond && <Pond />}
        {state.showConfirmationDialog && (
          <ConfirmationDialog
            onYesClick={state.confirmationDialogOnYes}
            onNoClick={() => setState({showConfirmationDialog: false})}
          />
        )}
      </div>
    );
  }
}
