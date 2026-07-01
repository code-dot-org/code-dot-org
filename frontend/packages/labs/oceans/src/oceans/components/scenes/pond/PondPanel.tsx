import {Box} from '@mui/material';
import * as React from 'react';

import PondFishPanel from '@/oceans/components/scenes/pond/PondFishPanel';
import PondGeneralPanel from '@/oceans/components/scenes/pond/PondGeneralPanel';
import {getState, setState} from '@/oceans/state';

/*
 * Pond explanation panel — thin orchestrator that picks between the general
 * (no fish clicked) and fish-specific variants and routes the shared
 * "dismiss on click" handler.  Each variant owns its bars and layout.
 */

class PondPanel extends React.Component {
  /** Hide the panel; the surrounding pond click should not also fire. */
  onPondPanelClick = (e: React.MouseEvent) => {
    setState({pondPanelShowing: false});
    e.stopPropagation();
  };

  render() {
    const state = getState();
    const maxExplainValue = state.showRecallFish
      ? state.pondRecallFishMaxExplainValue
      : state.pondFishMaxExplainValue;
    const clickedFish = state.pondClickedFish;
    return (
      <Box>
        {!clickedFish && state.pondExplainGeneralSummary && (
          <PondGeneralPanel
            summary={state.pondExplainGeneralSummary}
            onDismiss={this.onPondPanelClick}
          />
        )}
        {clickedFish && state.pondExplainFishSummary && (
          <PondFishPanel
            summary={state.pondExplainFishSummary}
            maxExplainValue={maxExplainValue}
            word={state.word!}
            side={state.pondPanelSide}
            onDismiss={this.onPondPanelClick}
          />
        )}
      </Box>
    );
  }
}
export default PondPanel;
