import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import {ChartType} from '../dataUtils';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';

class DropdownField extends React.Component {
  static propTypes = {
    displayName: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    disabledOptions: PropTypes.array,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inlineLabel: PropTypes.bool
  };

  getDisplayNameForChartType(chartType) {
    switch (chartType) {
      case ChartType.BAR_CHART:
        return msg.barChart();
      case ChartType.HISTOGRAM:
        return msg.histogram();
      case ChartType.SCATTER_PLOT:
        return msg.scatterPlot();
      case ChartType.CROSS_TAB:
        return msg.crossTab();
      default:
        return chartType;
    }
  }

  render() {
    const labelStyle = this.props.inlineLabel
      ? {
          ...rowStyle.description,
          float: 'left',
          marginTop: '5px',
          paddingRight: '5px'
        }
      : rowStyle.description;

    const containerStyle = {
      paddingLeft: this.props.inlineLabel ? 10 : 20,
      float: 'left',
      marginBottom: 8
    };

    return (
      <div style={containerStyle}>
        <label style={labelStyle}>{this.props.displayName}</label>
        <select value={this.props.value} onChange={this.props.onChange}>
          <option value="">{msg.select()}</option>
          {this.props.options.map(option => (
            <option
              key={option}
              disabled={
                this.props.disabledOptions &&
                this.props.disabledOptions.includes(option)
              }
              value={option}
            >
              {this.getDisplayNameForChartType(option)}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default Radium(DropdownField);
