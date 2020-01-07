import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import {DebounceInput} from 'react-debounce-input';
import _ from 'lodash';
import msg from '@cdo/locale';
import color from '../../../util/color';
import * as dataStyles from '../dataStyles';
import * as rowStyle from '@cdo/apps/applab/designElements/rowStyle';
import {ChartType, isBlank} from '../dataUtils';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DropdownField from './DropdownField';
import DataVisualizer from './DataVisualizer';

const styles = {
  container: {
    display: 'inline-block'
  },
  modalBody: {
    overflow: 'auto',
    maxHeight: '90%'
  },
  input: {
    ...rowStyle.container,
    float: 'left'
  },
  placeholderContainer: {
    position: 'relative',
    textAlign: 'center'
  },
  placeholderText: {
    position: 'absolute',
    width: '100%',
    bottom: '50%',
    fontFamily: '"Gotham 5r", sans-serif, sans-serif',
    fontSize: 20,
    color: color.dark_charcoal
  }
};

export const INITIAL_STATE = {
  isVisualizerOpen: false,
  chartTitle: '',
  chartType: ChartType.NONE,
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
      case ChartType.BAR_CHART:
        return !!this.state.selectedColumn1;
      case ChartType.HISTOGRAM:
        return !!(this.state.selectedColumn1 && this.state.bucketSize);
      case ChartType.SCATTER_PLOT:
      case ChartType.CROSS_TAB:
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
    const parsedRecords = this.parseRecords(this.props.tableRecords);
    const numericColumns = this.findNumericColumns(
      parsedRecords,
      this.props.tableColumns
    );

    let disabledOptions = [];
    const disableNonNumericColumns = [
      ChartType.SCATTER_PLOT,
      ChartType.HISTOGRAM
    ].includes(this.state.chartType);
    if (disableNonNumericColumns) {
      disabledOptions = _.difference(this.props.tableColumns, numericColumns);
    }
    const isMultiColumnChart = [
      ChartType.SCATTER_PLOT,
      ChartType.CROSS_TAB
    ].includes(this.state.chartType);

    return (
      <span style={styles.container}>
        <button
          type="button"
          style={dataStyles.whiteButton}
          onClick={this.handleOpen}
        >
          {msg.visualizeData()}
        </button>
        <BaseDialog
          isOpen={this.state.isVisualizerOpen}
          handleClose={this.handleClose}
          fullWidth
          fullHeight
        >
          <div style={styles.modalBody}>
            <h2> {msg.exploreDataset({datasetName: this.props.tableName})} </h2>

            <div>
              <div style={styles.input}>
                <label style={rowStyle.description}>
                  {msg.dataVisualizerChartTitle()}
                </label>
                <DebounceInput
                  style={rowStyle.input}
                  minLength={1}
                  debounceTimeout={500}
                  value={this.state.chartTitle}
                  onChange={event =>
                    this.setState({chartTitle: event.target.value})
                  }
                />
              </div>
            </div>

            <DropdownField
              displayName={msg.dataVisualizerChartType()}
              options={[
                ChartType.BAR_CHART,
                ChartType.HISTOGRAM,
                ChartType.SCATTER_PLOT,
                ChartType.CROSS_TAB
              ]}
              getDisplayNameForOption={this.getDisplayNameForChartType}
              value={this.state.chartType}
              onChange={event =>
                this.setState({
                  chartType: parseFloat(event.target.value),
                  selectedColumn1: '',
                  selectedColumn2: ''
                })
              }
            />

            {this.state.chartType === ChartType.HISTOGRAM && (
              <div style={styles.input}>
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
              displayName={
                isMultiColumnChart
                  ? msg.dataVisualizerXValues()
                  : msg.dataVisualizerValues()
              }
              options={this.props.tableColumns}
              disabledOptions={disabledOptions}
              value={this.state.selectedColumn1}
              onChange={event =>
                this.setState({selectedColumn1: event.target.value})
              }
            />

            {isMultiColumnChart && (
              <DropdownField
                displayName={msg.dataVisualizerYValues()}
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
            <div style={styles.placeholderContainer}>
              <div style={styles.placeholderText}>
                {msg.dataVisualizerPlaceholderText()}
              </div>
              <img src={require('./placeholder.png')} />
            </div>
          )}
          <div style={{paddingTop: 20}}>
            <DropdownField
              displayName={msg.filter()}
              options={[1, 2, 3]}
              disabledOptions={[]}
              value={this.state.filterColumn}
              onChange={event =>
                this.setState({
                  filterColumn: event.target.value,
                  filterValue: ''
                })
              }
              inlineLabel
            />
            <DropdownField
              displayName={msg.by()}
              options={[]}
              disabledOptions={[]}
              value={this.state.filterValue}
              onChange={event =>
                this.setState({filterValue: event.target.value})
              }
              inlineLabel
            />
            <DropdownField
              displayName={msg.dataVisualizerCreateChart()}
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
              {msg.create()}
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
