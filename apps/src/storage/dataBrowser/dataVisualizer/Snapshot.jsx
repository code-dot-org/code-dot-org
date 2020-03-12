import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import msg from '@cdo/locale';
import DataVisualizer from './DataVisualizer';
import * as dataStyles from '../dataStyles';

class Snapshot extends React.Component {
  static propTypes = {
    records: PropTypes.array.isRequired,
    numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    chartType: PropTypes.number.isRequired,
    bucketSize: PropTypes.string,
    chartTitle: PropTypes.string,
    selectedColumn1: PropTypes.string,
    selectedColumn2: PropTypes.string,
    filterColumn: PropTypes.string,
    filterValue: PropTypes.string,
    isMultiColumnChart: PropTypes.bool,
    // Provided via Redux
    tableName: PropTypes.string,
    projectName: PropTypes.string
  };

  state = {
    isSnapshotOpen: false
  };

  handleOpen = () => this.setState({isSnapshotOpen: true});

  handleClose = () => this.setState({isSnapshotOpen: false});

  copy = () => {}; // todo
  save = () => {}; // todo

  getDisplayableChartOptions = () => {
    const options = [];
    if (!!this.props.selectedColumn1) {
      options.push(
        `${
          this.props.isMultiColumnChart
            ? msg.dataVisualizerXValues()
            : msg.dataVisualizerValues()
        }: ${this.props.selectedColumn1}`
      );
    }
    if (!!this.props.selectedColumn2) {
      options.push(
        `${msg.dataVisualizerYValues()}: ${this.props.selectedColumn2}`
      );
    }
    if (!!this.props.bucketSize) {
      options.push(
        `${msg.dataVisualizerBucketSize()}: ${this.props.bucketSize}`
      );
    }
    if (!!this.props.filterColumn && !!this.props.filterValue) {
      options.push(
        msg.dataVisualizerFilterDescription({
          column: this.props.filterColumn,
          value: this.props.filterValue
        })
      );
    }
    return options.join(', ');
  };

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
          <DataVisualizer
            records={this.props.records}
            numericColumns={this.props.numericColumns}
            chartType={this.props.chartType}
            bucketSize={this.props.bucketSize}
            chartTitle={''} // We show the title as an <h1>, so we don't need to also show it in the chart itself
            selectedColumn1={this.props.selectedColumn1}
            selectedColumn2={this.props.selectedColumn2}
          />
          <p>
            {msg.dataVisualizerSnapshotDescription({
              date: moment().format('YYYY/MM/DD'),
              table: this.props.tableName,
              project: this.props.projectName
            })}
          </p>
          <p>{this.getDisplayableChartOptions()}</p>
          <button
            type="button"
            style={dataStyles.grayButton}
            onClick={this.copy}
          >
            {msg.copy()}
          </button>
          <button
            type="button"
            style={dataStyles.grayButton}
            onClick={this.save}
          >
            {msg.save()}
          </button>
        </BaseDialog>
      </div>
    );
  }
}

export default connect(state => ({
  tableName: state.data.tableName || '',
  projectName: state.header.projectName || ''
}))(Snapshot);
