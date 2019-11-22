import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import CrossTabChart from './CrossTabChart';
import GoogleChartWrapper from './GoogleChartWrapper';

class DataVisualizer extends React.Component {
  static propTypes = {
    parsedRecords: PropTypes.array,
    numericColumns: PropTypes.arrayOf(PropTypes.string),
    bucketSize: PropTypes.string,
    chartType: PropTypes.string,
    chartTitle: PropTypes.string,
    column1: PropTypes.string,
    column2: PropTypes.string,
    isCellEmpty: PropTypes.func.isRequired
  };

  ignoreMissingValues = (records, column1, column2) => {
    let filteredRecords = records;
    if (column1) {
      filteredRecords = filteredRecords.filter(
        record => !this.props.isCellEmpty(record[column1])
      );
    }

    if (column2) {
      filteredRecords = filteredRecords.filter(
        record => !this.props.isCellEmpty(record[column2])
      );
    }
    return filteredRecords;
  };

  render() {
    if (this.props.chartType === 'Cross Tab') {
      return (
        <CrossTabChart
          parsedRecords={this.ignoreMissingValues(
            this.props.parsedRecords,
            this.props.column1,
            this.props.column2
          )}
          numericColumns={this.props.numericColumns}
          chartTitle={this.props.chartTitle}
          column1={this.props.column1}
          column2={this.props.column2}
          ignoreMissingValues={this.ignoreMissingValues}
        />
      );
    } else {
      return (
        <GoogleChartWrapper
          parsedRecords={this.props.parsedRecords}
          numericColumns={this.props.numericColumns}
          bucketSize={this.props.bucketSize}
          chartType={this.props.chartType}
          chartTitle={this.props.chartTitle}
          column1={this.props.column1}
          column2={this.props.column2}
          ignoreMissingValues={this.ignoreMissingValues}
        />
      );
    }
  }
}

export default Radium(DataVisualizer);
