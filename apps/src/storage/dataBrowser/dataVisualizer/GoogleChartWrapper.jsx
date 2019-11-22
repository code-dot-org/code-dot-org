import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import _ from 'lodash';
import GoogleChart from '@cdo/apps/applab/GoogleChart';

class GoogleChartWrapper extends React.Component {
  static propTypes = {
    parsedRecords: PropTypes.array,
    numericColumns: PropTypes.arrayOf(PropTypes.string),
    bucketSize: PropTypes.number,
    chartType: PropTypes.string.isRequired,
    chartTitle: PropTypes.string,
    column1: PropTypes.string,
    column2: PropTypes.string,
    ignoreMissingValues: PropTypes.func.isRequired
  };

  aggregateRecordsByColumn = (records, columnName) => {
    const counts = _.countBy(records, r => r[columnName]);

    return _.map(counts, (count, key) => ({[columnName]: key, count}));
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
    switch (this.props.chartType) {
      case 'Bar Chart':
        if (this.props.column1) {
          chart = new GoogleChart.MaterialBarChart(targetDiv);
          let records = this.props.ignoreMissingValues(
            this.props.parsedRecords,
            this.props.column1
          );
          chartData = this.aggregateRecordsByColumn(
            records,
            this.props.column1
          );
          columns = [this.props.column1, 'count'];
        }
        break;
      case 'Histogram':
        if (this.props.column1 && this.props.bucketSize) {
          options.histogram = {bucketSize: this.props.bucketSize};
          chart = new GoogleChart.Histogram(targetDiv);
          chartData = this.props.ignoreMissingValues(
            this.props.parsedRecords,
            this.props.column1
          );
          columns = [this.props.column1];
        }
        break;
      case 'Scatter Plot':
        if (this.props.column1 && this.props.column2) {
          chart = new GoogleChart.MaterialScatterChart(targetDiv);
          chartData = this.props.ignoreMissingValues(
            this.props.parsedRecords,
            this.props.column1,
            this.props.column2
          );
          columns = [this.props.column1, this.props.column2];
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

  render() {
    this.updateChart();
    return <div id="chart-area" />;
  }
}

export default Radium(GoogleChartWrapper);
