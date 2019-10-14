import React from 'react';
import Radium from 'radium';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import * as dataStyles from './dataStyles';

const INITIAL_STATE = {
  isVisualizerOpen: false
};

class DataVisualizer extends React.Component {
  static propTypes = {};

  state = {...INITIAL_STATE};

  handleClose = () => {
    this.setState({isVisualizerOpen: false});
  };

  render() {
    return (
      <span style={[{display: 'inline-block'}]}>
        <button
          type="button"
          style={dataStyles.whiteButton}
          onClick={() => this.setState({isVisualizerOpen: true})}
        >
          Show Viz (Placeholder)
        </button>
        <BaseDialog
          isOpen={this.state.isVisualizerOpen}
          handleClose={this.handleClose}
          fullWidth
          fullHeight
        >
          <p> Placeholder text </p>
        </BaseDialog>
      </span>
    );
  }
}
export default Radium(DataVisualizer);
