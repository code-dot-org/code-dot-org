import React from 'react';
import PropTypes from 'prop-types';
import {ignoreMissingValues} from '../dataUtils';
import CrossTabChart from './CrossTabChart';
import GoogleChartWrapper from './GoogleChartWrapper';

class DataVisualizer extends React.Component {
  static propTypes = {
    records: PropTypes.array.isRequired,
    numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    chartType: PropTypes.string.isRequired,
    bucketSize: PropTypes.string,
    chartTitle: PropTypes.string,
    selectedColumn1: PropTypes.string,
    selectedColumn2: PropTypes.string
  };

  render() {
    if (this.props.chartType === 'Cross Tab') {
      return (
        <CrossTabChart
          records={ignoreMissingValues(this.props.records, [
            this.props.selectedColumn1,
            this.props.selectedColumn2
          ])}
          numericColumns={this.props.numericColumns}
          chartTitle={this.props.chartTitle}
          selectedColumn1={this.props.selectedColumn1}
          selectedColumn2={this.props.selectedColumn2}
        />
      );
    } else {
      return (
        <GoogleChartWrapper
          records={this.props.records}
          numericColumns={this.props.numericColumns}
          chartType={this.props.chartType}
          bucketSize={this.props.bucketSize}
          chartTitle={this.props.chartTitle}
          selectedColumn1={this.props.selectedColumn1}
          selectedColumn2={this.props.selectedColumn2}
        />
      );
    }
  }
}

export default DataVisualizer;
