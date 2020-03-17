import React from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import * as dataStyles from '../dataStyles';

class Snapshot extends React.Component {
  static propTypes = {
    chartTitle: PropTypes.string.isRequired
  };

  state = {
    isSnapshotOpen: false
  };

  handleOpen = () => this.setState({isSnapshotOpen: true});
  handleClose = () => this.setState({isSnapshotOpen: false});

  render() {
    return (
      <div>
        <button
          type="button"
          style={dataStyles.grayButton}
          onClick={this.handleOpen}
        >
          {msg.dataVisualizerViewSnapshot()}
        </button>
        <BaseDialog
          isOpen={this.state.isSnapshotOpen}
          handleClose={this.handleClose}
          fullWidth
          fullHeight
        >
          <h1>{this.props.chartTitle}</h1>
        </BaseDialog>
      </div>
    );
  }
}

export default Snapshot;
