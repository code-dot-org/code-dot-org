import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import _ from 'lodash';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DropdownField from './DropdownField';
import * as dataStyles from './dataStyles';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';
import GoogleChart from '@cdo/apps/applab/GoogleChart';
import CrossTabChart from './CrossTabChart';

const INITIAL_STATE = {
  isVisualizerOpen: false,
  chartTitle: '',
  chartType: '',
  bucketSize: 0,
  values: '',
  xValues: '',
  yValues: '',
  parsedRecords: [],
  numericColumns: []
};

class DataVisualizer extends React.Component {
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

  aggregateRecordsByColumn = (records, columnName) => {
    const counts = _.countBy(records, r => r[columnName]);

    return _.map(counts, (count, key) => ({[columnName]: key, count}));
  };

  isCellEmpty = value => {
    return value === undefined || value === '' || value === null;
  };

  ignoreMissingValues = (records, column1, column2) => {
    let filteredRecords = records;
    if (column1) {
      filteredRecords = filteredRecords.filter(
        record => !this.isCellEmpty(record[column1])
      );
    }

    if (column2) {
      filteredRecords = filteredRecords.filter(
        record => !this.isCellEmpty(record[column2])
      );
    }
    return filteredRecords;
  };

  updateChart = () => {
    const targetDiv = document.getElementById('chart-area');
    if (!targetDiv) {
      return;
    }

    let chart;
    let chartData;
    let columns;
    const options = {};
    switch (this.state.chartType) {
      case 'Bar Chart':
        if (this.state.values) {
          chart = new GoogleChart.MaterialBarChart(targetDiv);
          let records = this.ignoreMissingValues(
            this.state.parsedRecords,
            this.state.values
          );
          chartData = this.aggregateRecordsByColumn(records, this.state.values);
          columns = [this.state.values, 'count'];
        }
        break;
      case 'Histogram':
        if (this.state.values && this.state.bucketSize) {
          options.histogram = {bucketSize: this.state.bucketSize};
          chart = new GoogleChart.Histogram(targetDiv);
          chartData = this.ignoreMissingValues(
            this.state.parsedRecords,
            this.state.values
          );
          columns = [this.state.values];
        }
        break;
      case 'Cross Tab':
        // Cross Tab is rendered by React, so no Google Chart is required.
        break;
      case 'Scatter Plot':
        if (this.state.xValues && this.state.yValues) {
          chart = new GoogleChart.MaterialScatterChart(targetDiv);
          chartData = this.ignoreMissingValues(
            this.state.parsedRecords,
            this.state.xValues,
            this.state.yValues
          );
          columns = [this.state.xValues, this.state.yValues];
        }
        break;
      default:
        console.warn(`unknown chart type ${this.state.chartType}`);
        break;
    }
    if (chart && chartData) {
      chart.drawChart(chartData, columns, options);
    }
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
    if (
      this.state.isVisualizerOpen &&
      this.props.tableRecords &&
      this.state.chartType
    ) {
      this.updateChart();
    }

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

    const modalBody = (
      <div style={{overflow: 'auto', maxHeight: '90%'}}>
        <h1> Explore {this.props.tableName} </h1>
        <h2> Overview </h2>
        <div id="selection-area">
          <div style={rowStyle.container}>
            <label style={rowStyle.description}>Chart Title</label>
            <input
              style={rowStyle.input}
              value={this.state.chartTitle}
              onChange={event =>
                this.setState({chartTitle: event.target.value})
              }
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
          {(this.state.chartType === 'Bar Chart' ||
            this.state.chartType === 'Histogram') && (
            <DropdownField
              displayName="Values"
              options={options}
              disabledOptions={disabledOptions}
              value={this.state.values}
              onChange={event => this.setState({values: event.target.value})}
            />
          )}

          {(this.state.chartType === 'Cross Tab' ||
            this.state.chartType === 'Scatter Plot') && (
            <div>
              <DropdownField
                displayName="X Values"
                options={options}
                disabledOptions={disabledOptions}
                value={this.state.xValues}
                onChange={event => this.setState({xValues: event.target.value})}
              />
              <DropdownField
                displayName="Y Values"
                options={options}
                disabledOptions={disabledOptions}
                value={this.state.yValues}
                onChange={event => this.setState({yValues: event.target.value})}
              />
            </div>
          )}
        </div>
        {this.state.chartType === 'Cross Tab' ? (
          <CrossTabChart
            parsedRecords={this.ignoreMissingValues(
              this.state.parsedRecords,
              this.state.xValues,
              this.state.yValues
            )}
            numericColumns={this.state.numericColumns}
            rowName={this.state.xValues}
            columnName={this.state.yValues}
          />
        ) : (
          <div id="chart-area" />
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
          {modalBody}
        </BaseDialog>
      </span>
    );
  }
}

export const UnconnectedDataVisualizer = Radium(DataVisualizer);

export default connect(state => ({
  tableColumns: state.data.tableColumns || [],
  tableRecords: state.data.tableRecords || {},
  tableName: state.data.tableName || ''
}))(Radium(DataVisualizer));
