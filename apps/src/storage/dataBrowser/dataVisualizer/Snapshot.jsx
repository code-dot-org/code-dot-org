import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';
import msg from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import * as dataStyles from '../dataStyles';

class Snapshot extends React.Component {
  static propTypes = {
    chartTitle: PropTypes.string.isRequired,
    selectedOptions: PropTypes.string.isRequired,
    // Provided via Redux
    tableName: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired
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
          <p>
            {msg.dataVisualizerSnapshotDescription({
              date: moment().format('YYYY/MM/DD'),
              table: this.props.tableName,
              project: this.props.projectName
            })}
          </p>
          <p>{this.props.selectedOptions}</p>
        </BaseDialog>
      </div>
    );
  }
}

export default connect(state => ({
  tableName: state.data.tableName || '',
  projectName: state.header.projectName || ''
}))(Snapshot);
