import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DropdownField from './DropdownField';
import * as dataStyles from '../dataStyles';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';
import DataVisualizer from './DataVisualizer';

const INITIAL_STATE = {
  isVisualizerOpen: false,
  chartTitle: '',
  chartType: '',
  bucketSize: '',
  column1: '',
  column2: '',
  parsedRecords: [],
  numericColumns: []
};

class VisualizerModal extends React.Component {
  static propTypes = {
    // from redux state
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    // "if all of the keys are integers, and more than half of the keys between 0 and
    // the maximum key in the object have non-empty values, then Firebase will render
    // it as an array."
    // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
    tableRecords: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
      .isRequired
  };

  state = {...INITIAL_STATE};

  handleOpen = () => {
    this.setState({isVisualizerOpen: true});
  };

  handleClose = () => {
    this.setState({...INITIAL_STATE});
  };

  parseRecords = () => {
    if (Object.keys(this.props.tableRecords).length === 0) {
      return [];
    } else {
      let parsedRecords = [];
      this.props.tableRecords.forEach(record => {
        if (record) {
          parsedRecords.push(JSON.parse(record));
        }
      });
      return parsedRecords;
    }
  };

  isCellEmpty = value => {
    return value === undefined || value === '' || value === null;
  };

  findNumericColumns = records => {
    return this.props.tableColumns.filter(
      column =>
        records.filter(
          record =>
            this.isCellEmpty(record[column]) ||
            typeof record[column] === 'number'
        ).length === records.length
    );
  };

  componentDidUpdate(previousProps, prevState) {
    const visualizerJustOpened =
      !prevState.isVisualizerOpen && this.state.isVisualizerOpen;

    const recordsChangedWithVisualizerOpen =
      this.props.tableRecords !== previousProps.tableRecords &&
      this.state.isVisualizerOpen;

    if (visualizerJustOpened || recordsChangedWithVisualizerOpen) {
      let parsedRecords = this.parseRecords();
      let numericColumns = this.findNumericColumns(parsedRecords);
      this.setState({
        parsedRecords: parsedRecords,
        numericColumns: numericColumns
      });
    }
  }

  render() {
    let options = this.props.tableColumns;
    let disabledOptions = [];

    const disableNonNumericColumns =
      this.state.chartType === 'Scatter Plot' ||
      this.state.chartType === 'Histogram';

    if (disableNonNumericColumns) {
      disabledOptions = _.difference(
        this.props.tableColumns,
        this.state.numericColumns
      );
    }

    const chartOptions = (
      <div>
        <div style={rowStyle.container}>
          <label style={rowStyle.description}>Chart Title</label>
          <input
            style={rowStyle.input}
            value={this.state.chartTitle}
            onChange={event => this.setState({chartTitle: event.target.value})}
          />
        </div>

        <DropdownField
          displayName="Chart Type"
          options={['Bar Chart', 'Histogram', 'Cross Tab', 'Scatter Plot']}
          value={this.state.chartType}
          onChange={event => this.setState({chartType: event.target.value})}
        />

        {this.state.chartType === 'Histogram' && (
          <div style={rowStyle.container}>
            <label style={rowStyle.description}>Bucket Size</label>
            <input
              style={rowStyle.input}
              value={this.state.bucketSize}
              onChange={event =>
                this.setState({bucketSize: event.target.value})
              }
            />
          </div>
        )}
        <DropdownField
          displayName="Values"
          options={options}
          disabledOptions={disabledOptions}
          value={this.state.column1}
          onChange={event => this.setState({column1: event.target.value})}
        />

        {(this.state.chartType === 'Cross Tab' ||
          this.state.chartType === 'Scatter Plot') && (
          <DropdownField
            displayName="Y Values"
            options={options}
            disabledOptions={disabledOptions}
            value={this.state.column2}
            onChange={event => this.setState({column2: event.target.value})}
          />
        )}
      </div>
    );

    return (
      <span style={{display: 'inline-block'}}>
        <button
          type="button"
          style={dataStyles.whiteButton}
          onClick={this.handleOpen}
        >
          Show Viz (Placeholder)
        </button>
        <BaseDialog
          isOpen={this.state.isVisualizerOpen}
          handleClose={this.handleClose}
          fullWidth
          fullHeight
        >
          <div style={{overflow: 'auto', maxHeight: '90%'}}>
            <h1> Explore {this.props.tableName} </h1>
            <h2> Overview </h2>
            {chartOptions}
            {this.state.chartType && (
              <DataVisualizer
                parsedRecords={this.state.parsedRecords}
                numericColumns={this.state.numericColumns}
                bucketSize={this.state.bucketSize}
                chartType={this.state.chartType}
                chartTitle={this.state.chartTitle}
                column1={this.state.column1}
                column2={this.state.column2}
                isCellEmpty={this.isCellEmpty}
              />
            )}
          </div>
        </BaseDialog>
      </span>
    );
  }
}

export const UnconnectedVisualizerModal = Radium(VisualizerModal);

export default connect(state => ({
  tableColumns: state.data.tableColumns || [],
  tableRecords: state.data.tableRecords || {},
  tableName: state.data.tableName || ''
}))(Radium(VisualizerModal));
