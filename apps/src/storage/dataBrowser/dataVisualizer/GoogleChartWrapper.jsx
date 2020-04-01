import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ChartType, ignoreMissingValues} from '../dataUtils';
import {GOOGLE_CHART_AREA} from './constants';
import GoogleChart from '@cdo/apps/applab/GoogleChart';

class GoogleChartWrapper extends React.Component {
  static propTypes = {
    records: PropTypes.array.isRequired,
    numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    chartType: PropTypes.number.isRequired,
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
      case ChartType.BAR_CHART:
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
      case ChartType.HISTOGRAM:
        if (this.props.selectedColumn1 && this.props.bucketSize) {
          options.histogram = {bucketSize: this.props.bucketSize};
          chart = new GoogleChart.Histogram(this.chartArea);
          chartData = ignoreMissingValues(this.props.records, [
            this.props.selectedColumn1
          ]);
          columns = [this.props.selectedColumn1];
        }
        break;
      case ChartType.SCATTER_PLOT:
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
    return (
      <div id={GOOGLE_CHART_AREA} ref={element => (this.chartArea = element)} />
    );
  }
}

export default GoogleChartWrapper;
