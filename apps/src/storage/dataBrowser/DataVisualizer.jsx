import React from 'react';
import Radium from 'radium';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import * as dataStyles from './dataStyles';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';

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

  handleOpen = () => {
    this.setState({isVisualizerOpen: true});
  };

  handleClose = () => {
    this.setState({isVisualizerOpen: false});
  };

  handleChange = (field, value) => {
    this.setState({[field]: value});
  };

  render() {
    const dropdownField = (fieldName, displayName, values) => (
      <div id={fieldName} style={rowStyle.container}>
        <label style={rowStyle.description}>{displayName}</label>
        <select
          value={this.state[fieldName]}
          onChange={event => this.handleChange(fieldName, event.target.value)}
        >
          <option value="">Select</option>
          {values.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    );

    const modalBody = (
      <div>
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

          {dropdownField('chartType', 'Chart Type', [
            'Bar Chart',
            'Histogram',
            'Cross Tab',
            'Scatter Plot'
          ])}

          {this.state.chartType === 'Histogram' && (
            <div id="numBinsRow" style={rowStyle.container}>
              <label style={rowStyle.description}>Bins</label>
              <input
                style={rowStyle.input}
                value={this.state.numBins}
                onChange={event =>
                  this.handleChange('numBins', event.target.value)
                }
              />
            </div>
          )}
          {(this.state.chartType === 'Bar Chart' ||
            this.state.chartType === 'Histogram') &&
            dropdownField('values', 'Values', this.props.tableColumns)}

          {(this.state.chartType === 'Cross Tab' ||
            this.state.chartType === 'Scatter Plot') && (
            <div>
              {dropdownField('xValues', 'X Values', this.props.tableColumns)}
              {dropdownField('yValues', 'Y Values', this.props.tableColumns)}
            </div>
          )}
        </div>
        <div id="chart-area" />
      </div>
    );

    return (
      <span style={[{display: 'inline-block'}]}>
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
