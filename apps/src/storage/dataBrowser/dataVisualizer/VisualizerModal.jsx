import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import _ from 'lodash';
import * as dataStyles from '../dataStyles';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';
import {isBlank} from '../dataUtils';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DropdownField from './DropdownField';
import DataVisualizer from './DataVisualizer';
import ChartPlaceholder from './ChartPlaceholder';

const INITIAL_STATE = {
  isVisualizerOpen: false,
  chartTitle: '',
  chartType: '',
  bucketSize: '',
  selectedColumn1: '',
  selectedColumn2: '',
  filterColumn: '',
  filterValue: '',
  screen: ''
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

  handleOpen = () => this.setState({isVisualizerOpen: true});

  handleClose = () => this.setState({isVisualizerOpen: false});

  canDisplayChart = () => {
    switch (this.state.chartType) {
      case 'Bar Chart':
        return !!this.state.selectedColumn1;
      case 'Histogram':
        return !!(this.state.selectedColumn1 && this.state.bucketSize);
      case 'Scatter Plot':
      case 'Cross Tab':
        return !!(this.state.selectedColumn1 && this.state.selectedColumn2);
      default:
        return false;
    }
  };

  parseRecords = memoize(rawRecords => {
    if (Object.keys(rawRecords).length === 0) {
      return [];
    } else {
      let parsedRecords = [];
      rawRecords.forEach(record => {
        if (record) {
          parsedRecords.push(JSON.parse(record));
        }
      });
      return parsedRecords;
    }
  });

  findNumericColumns = memoize((records, columns) => {
    const isNumericOrBlank = x => isBlank(x) || typeof x === 'number';
    const isColumnNumeric = (records, column) =>
      records.every(record => isNumericOrBlank(record[column]));
    return columns.filter(column => isColumnNumeric(records, column));
  });

  render() {
    const parsedRecords = this.parseRecords(this.props.tableRecords);
    const numericColumns = this.findNumericColumns(
      parsedRecords,
      this.props.tableColumns
    );

    let disabledOptions = [];
    const disableNonNumericColumns = ['Scatter Plot', 'Histogram'].includes(
      this.state.chartType
    );
    if (disableNonNumericColumns) {
      disabledOptions = _.difference(this.props.tableColumns, numericColumns);
    }
    const isMultiColumnChart = ['Scatter Plot', 'Cross Tab'].includes(
      this.state.chartType
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
            <h2> Explore {this.props.tableName} </h2>

            <div>
              <div style={{...rowStyle.container, float: 'left'}}>
                <label style={rowStyle.description}>Chart Title</label>
                <input
                  style={rowStyle.input}
                  value={this.state.chartTitle}
                  onChange={event =>
                    this.setState({chartTitle: event.target.value})
                  }
                />
              </div>
            </div>

            <DropdownField
              displayName="Chart Type"
              options={['Bar Chart', 'Histogram', 'Scatter Plot', 'Cross Tab']}
              value={this.state.chartType}
              onChange={event => this.setState({chartType: event.target.value})}
            />

            {this.state.chartType === 'Histogram' && (
              <div style={{...rowStyle.container, float: 'left'}}>
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
              displayName={isMultiColumnChart ? 'X Values' : 'Values'}
              options={this.props.tableColumns}
              disabledOptions={disabledOptions}
              value={this.state.selectedColumn1}
              onChange={event =>
                this.setState({selectedColumn1: event.target.value})
              }
            />

            {isMultiColumnChart && (
              <DropdownField
                displayName="Y Values"
                options={this.props.tableColumns}
                disabledOptions={disabledOptions}
                value={this.state.selectedColumn2}
                onChange={event =>
                  this.setState({selectedColumn2: event.target.value})
                }
              />
            )}
          </div>
          {this.canDisplayChart() ? (
            <DataVisualizer
              records={parsedRecords}
              numericColumns={numericColumns}
              chartType={this.state.chartType}
              bucketSize={this.state.bucketSize}
              chartTitle={this.state.chartTitle}
              selectedColumn1={this.state.selectedColumn1}
              selectedColumn2={this.state.selectedColumn2}
            />
          ) : (
            <ChartPlaceholder />
          )}
          <div style={{paddingTop: 20}}>
            <DropdownField
              displayName="Filter"
              options={[1, 2, 3]}
              disabledOptions={[]}
              value={this.state.filterColumn}
              onChange={event =>
                this.setState({filterColumn: event.target.value})
              }
              inlineLabel
            />
            <DropdownField
              displayName="by"
              options={[]}
              disabledOptions={[]}
              value={this.state.filterValue}
              onChange={event =>
                this.setState({filterValue: event.target.value})
              }
              inlineLabel
            />
            <DropdownField
              displayName="Create chart on screen"
              options={[]}
              disabledOptions={[]}
              value={this.state.screen}
              onChange={event => this.setState({screen: event.target.value})}
              inlineLabel
            />
            <button
              type="button"
              style={dataStyles.grayButton}
              onClick={this.handleOpen}
            >
              Create
            </button>
          </div>
        </BaseDialog>
      </span>
    );
  }
}

export const UnconnectedVisualizerModal = VisualizerModal;
export default connect(state => ({
  tableColumns: state.data.tableColumns || [],
  tableRecords: state.data.tableRecords || {},
  tableName: state.data.tableName || ''
}))(VisualizerModal);
