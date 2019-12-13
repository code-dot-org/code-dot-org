import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ignoreMissingValues} from '../dataUtils';
import GoogleChart from '@cdo/apps/applab/GoogleChart';

class GoogleChartWrapper extends React.Component {
  static propTypes = {
    records: PropTypes.array.isRequired,
    numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    chartType: PropTypes.string.isRequired,
    bucketSize: PropTypes.string,
    chartTitle: PropTypes.string,
    selectedColumn1: PropTypes.string,
    selectedColumn2: PropTypes.string
  };

  chartArea = null;

  aggregateRecordsByColumn = (records, columnName) => {
    const counts = _.countBy(records, r => r[columnName]);

    return _.map(counts, (count, key) => ({[columnName]: key, count}));
  };

  componentDidMount() {
    this.updateChart();
  }

  componentDidUpdate() {
    this.updateChart();
  }

  updateChart() {
    if (!this.chartArea) {
      return;
    }
    let chart;
    let chartData;
    let columns;
    let options = {
      title: this.props.chartTitle || ''
    };

    switch (this.props.chartType) {
      case 'Bar Chart':
        if (this.props.selectedColumn1) {
          chart = new GoogleChart.MaterialBarChart(this.chartArea);
          let records = ignoreMissingValues(this.props.records, [
            this.props.selectedColumn1
          ]);
          chartData = this.aggregateRecordsByColumn(
            records,
            this.props.selectedColumn1
          );
          columns = [this.props.selectedColumn1, 'count'];
        }
        break;
      case 'Histogram':
        if (this.props.selectedColumn1 && this.props.bucketSize) {
          options.histogram = {bucketSize: this.props.bucketSize};
          chart = new GoogleChart.Histogram(this.chartArea);
          chartData = ignoreMissingValues(this.props.records, [
            this.props.selectedColumn1
          ]);
          columns = [this.props.selectedColumn1];
        }
        break;
      case 'Scatter Plot':
        if (this.props.selectedColumn1 && this.props.selectedColumn2) {
          chart = new GoogleChart.MaterialScatterChart(this.chartArea);
          chartData = ignoreMissingValues(this.props.records, [
            this.props.selectedColumn1,
            this.props.selectedColumn2
          ]);
          columns = [this.props.selectedColumn1, this.props.selectedColumn2];
        }
        break;
      default:
        console.warn(`unknown Google Chart type: ${this.props.chartType}`);
        break;
    }
    if (chart && chartData) {
      chart.drawChart(chartData, columns, options);
    }
  }

  render() {
    return <div ref={element => (this.chartArea = element)} />;
  }
}

export default GoogleChartWrapper;
