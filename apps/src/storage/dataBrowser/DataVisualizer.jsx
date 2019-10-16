import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import * as dataStyles from './dataStyles';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';
import GoogleChart from '@cdo/apps/applab/GoogleChart';

const INITIAL_STATE = {
  isVisualizerOpen: false,
  chartTitle: '',
  chartType: '',
  numBins: 0,
  values: '',
  xValues: '',
  yValues: ''
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

  handleClose = () => {
    this.setState({isVisualizerOpen: false});
  };

  handleChange = (field, value) => {
    this.setState({[field]: value});
  };

  aggregateRecordsByColumn = (records, columnName) => {
    let counts = {};
    records.forEach(record => {
      let value = record[columnName];
      counts[value] = (counts[value] || 0) + 1;
    });
    let chartData = [];
    Object.keys(counts).forEach(key => {
      chartData.push({[columnName]: key, count: counts[key]});
    });
    return chartData;
  };

  updateChart = () => {
    const targetDiv = document.getElementById('chart-area');
    const records =
      Object.keys(this.props.tableRecords).length > 0 &&
      this.props.tableRecords.map(tableRecord => JSON.parse(tableRecord));
    if (this.state.chartType === 'bar' && this.state.values) {
      var chart = new GoogleChart.MaterialBarChart(targetDiv);
      const chartData = this.aggregateRecordsByColumn(
        records,
        this.state.values
      );
      chart.drawChart(chartData, [this.state.values, 'count']);
    }
  };

  render() {
    const {chartType, numBins, values, xValues, yValues} = this.state;
    this.updateChart();

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
          <h1> Explore {this.props.tableName} </h1>
          <h2> Overview </h2>
          <div id="selection-area">
            <div id="chartTitleRow" style={rowStyle.container}>
              <label style={rowStyle.description}>Chart Title</label>
              <input
                style={rowStyle.input}
                onChange={event =>
                  this.handleChange('chartTitle', event.target.value)
                }
              />
            </div>

            <div id="chartTypeRow" style={rowStyle.container}>
              <label style={rowStyle.description}>Chart Type</label>
              <select
                value={chartType}
                onChange={event =>
                  this.handleChange('chartType', event.target.value)
                }
              >
                <option value="">Select</option>
                <option value="bar">Bar Chart</option>
                <option value="histogram">Histogram</option>
                <option value="crosstab">Cross Tab</option>
                <option value="scatter">Scatter Plot</option>
              </select>
              {chartType === 'histogram' && (
                <span>
                  <label style={rowStyle.description}>Bins</label>
                  <input
                    style={rowStyle.input}
                    value={numBins}
                    onChange={event =>
                      this.handleChange('numBins', event.target.value)
                    }
                  />
                </span>
              )}
            </div>
            {(chartType === 'bar' || chartType === 'histogram') && (
              <div id="valuesRow" style={rowStyle.container}>
                <label style={rowStyle.description}>Values</label>
                <select
                  value={values}
                  onChange={event =>
                    this.handleChange('values', event.target.value)
                  }
                >
                  <option value="">Select</option>
                  {this.props.tableColumns.map(columnName => (
                    <option key={columnName} value={columnName}>
                      {columnName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(chartType === 'crosstab' || chartType === 'scatter') && (
              <div id="xyValuesRow" style={rowStyle.container}>
                <label style={rowStyle.description}>X Values</label>
                <select
                  value={xValues}
                  onChange={event =>
                    this.handleChange('xValues', event.target.value)
                  }
                >
                  <option value="">Select</option>
                  {this.props.tableColumns.map(columnName => (
                    <option key={columnName} value={columnName}>
                      {columnName}
                    </option>
                  ))}
                </select>
                <label style={rowStyle.description}>Y Values</label>
                <select
                  value={yValues}
                  onChange={event =>
                    this.handleChange('yValues', event.target.value)
                  }
                >
                  <option value="">Select</option>
                  {this.props.tableColumns.map(columnName => (
                    <option key={columnName} value={columnName}>
                      {columnName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div id="chart-area" />
        </BaseDialog>
      </span>
    );
  }
}
export default connect(state => ({
  tableColumns: state.data.tableColumns || [],
  tableRecords: state.data.tableRecords || {},
  tableName: state.data.tableName || ''
}))(Radium(DataVisualizer));
