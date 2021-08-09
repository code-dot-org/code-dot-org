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
import {ChartType, isBlank, isNumber, isBoolean, toBoolean} from '../dataUtils';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DropdownField from './DropdownField';
import DataVisualizer from './DataVisualizer';
import Snapshot from './Snapshot';
import placeholderImage from './placeholder.png';

export const OperatorType = {
  EQUAL: 0,
  LESS_THAN: 1,
  LESS_THAN_OR_EQUAL: 2,
  GREATER_THAN: 3,
  GREATER_THAN_OR_EQUAL: 4
};

export const INITIAL_STATE = {
  isVisualizerOpen: false,
  chartTitle: '',
  chartType: ChartType.NONE,
  bucketSize: '',
  selectedColumn1: '',
  selectedColumn2: '',
  filterColumn: '',
  filterOperator: OperatorType.EQUAL,
  filterValue: '',
  screen: ''
};

class VisualizerModal extends React.Component {
  static propTypes = {
    // from redux state
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableName: PropTypes.string.isRequired,
    tableRecords: PropTypes.array.isRequired
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
    let parsedRecords = [];
    rawRecords.forEach(record => {
      if (record) {
        parsedRecords.push(JSON.parse(record));
      }
    });
    return parsedRecords;
  });

  findNumericColumns = memoize((records, columns) => {
    const isNumericOrBlank = x => isBlank(x) || typeof x === 'number';
    const isColumnNumeric = (records, column) =>
      records.every(record => isNumericOrBlank(record[column]));
    return columns.filter(column => isColumnNumeric(records, column));
  });

  getValuesForFilterColumn = memoize((records, column, isNumeric) => {
    let values = [];
    values = Array.from(new Set(records.map(record => record[column])));
    if (isNumeric) {
      values.sort((a, b) => a - b); // Sort numerically
    } else {
      values.sort(); // Sort alphabetically
    }
    values = values.map(x => (typeof x === 'string' ? `"${x}"` : `${x}`));

    return values;
  });

  filterRecords = memoize(
    (records = [], column, value, operator = OperatorType.EQUAL) => {
      let parsedValue;
      if (isNumber(value)) {
        parsedValue = parseFloat(value);
      } else if (isBoolean(value)) {
        parsedValue = toBoolean(value);
      } else if (value === 'undefined') {
        parsedValue = undefined;
      } else if (value === 'null') {
        parsedValue = null;
      } else {
        // We add quotes around strings to display in the dropdown, remove the quotes here so that
        // we filter on the actual value
        parsedValue = value.slice(1, -1);
      }
      switch (operator) {
        case OperatorType.GREATER_THAN:
          return records.filter(record => record[column] > parsedValue);
        case OperatorType.GREATER_THAN_OR_EQUAL:
          return records.filter(record => record[column] >= parsedValue);
        case OperatorType.LESS_THAN:
          return records.filter(record => record[column] < parsedValue);
        case OperatorType.LESS_THAN_OR_EQUAL:
          return records.filter(record => record[column] <= parsedValue);
        default:
          return records.filter(record => record[column] === parsedValue);
      }
    }
  );

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
  getDisplayNameForOperator(operator) {
    switch (operator) {
      case OperatorType.GREATER_THAN:
        return msg.greaterThan();
      case OperatorType.GREATER_THAN_OR_EQUAL:
        return msg.greaterThanOrEqualTo();
      case OperatorType.LESS_THAN:
        return msg.lessThan();
      case OperatorType.LESS_THAN_OR_EQUAL:
        return msg.lessThanOrEqualTo();
      default:
        return msg.equalTo();
    }
  }

  chartOptionsToString(chartType) {
    const options = [];
    switch (chartType) {
      case ChartType.BAR_CHART:
        options.push(
          `${msg.dataVisualizerValues()}: ${this.state.selectedColumn1}`
        );
        break;
      case ChartType.HISTOGRAM:
        options.push(
          `${msg.dataVisualizerValues()}: ${this.state.selectedColumn1}`
        );
        options.push(
          `${msg.dataVisualizerBucketSize()}: ${this.state.bucketSize}`
        );
        break;
      case ChartType.SCATTER_PLOT:
      case ChartType.CROSS_TAB:
        options.push(
          `${msg.dataVisualizerXValues()}: ${this.state.selectedColumn1}`
        );
        options.push(
          `${msg.dataVisualizerYValues()}: ${this.state.selectedColumn2}`
        );
        break;
      default:
    }
    if (!!this.state.filterColumn && !!this.state.filterValue) {
      options.push(
        msg.dataVisualizerFilterDescription({
          column: this.state.filterColumn,
          value: this.state.filterValue
        })
      );
    }
    return options.join(', ');
  }

  render() {
    const parsedRecords = this.parseRecords(this.props.tableRecords);
    let filteredRecords = parsedRecords;
    if (this.state.filterColumn !== '' && this.state.filterValue !== '') {
      filteredRecords = this.filterRecords(
        parsedRecords,
        this.state.filterColumn,
        this.state.filterValue,
        this.state.filterOperator
      );
    }
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
    const isFilterColumnNumeric = numericColumns.includes(
      this.state.filterColumn
    );
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
            <div>
              <h2 style={styles.h2}>
                {' '}
                {msg.exploreDataset({
                  datasetName: this.props.tableName
                })}{' '}
              </h2>

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
                  <label style={rowStyle.description}>
                    {msg.dataVisualizerBucketSize()}
                  </label>
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

            <div
              style={{
                ...styles.chartArea,
                overflow:
                  this.state.chartType === ChartType.CROSS_TAB
                    ? 'auto'
                    : 'hidden'
              }}
            >
              {this.canDisplayChart() ? (
                <DataVisualizer
                  records={filteredRecords}
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
                </div>
              )}
            </div>

            <div style={{paddingTop: 20}}>
              <DropdownField
                displayName={msg.filter()}
                options={this.props.tableColumns}
                disabledOptions={[]}
                value={this.state.filterColumn}
                onChange={event =>
                  this.setState({
                    filterColumn: event.target.value,
                    filterOperator: OperatorType.EQUAL,
                    filterValue: ''
                  })
                }
                inlineLabel
              />
              {isFilterColumnNumeric && (
                <DropdownField
                  displayName={msg.by()}
                  options={[
                    OperatorType.GREATER_THAN,
                    OperatorType.GREATER_THAN_OR_EQUAL,
                    OperatorType.EQUAL,
                    OperatorType.LESS_THAN_OR_EQUAL,
                    OperatorType.LESS_THAN
                  ]}
                  getDisplayNameForOption={this.getDisplayNameForOperator}
                  disabledOptions={[]}
                  value={this.state.filterOperator}
                  onChange={event =>
                    this.setState({
                      filterOperator: parseFloat(event.target.value)
                    })
                  }
                  inlineLabel
                />
              )}
              <DropdownField
                displayName={isFilterColumnNumeric ? '' : msg.by()}
                options={this.getValuesForFilterColumn(
                  parsedRecords,
                  this.state.filterColumn,
                  isFilterColumnNumeric
                )}
                disabledOptions={[]}
                value={this.state.filterValue}
                onChange={event =>
                  this.setState({filterValue: event.target.value})
                }
                inlineLabel
              />
            </div>
            <Snapshot
              chartType={this.state.chartType}
              chartTitle={this.state.chartTitle}
              selectedOptions={this.chartOptionsToString(this.state.chartType)}
            />
          </div>
        </BaseDialog>
      </span>
    );
  }
}

const styles = {
  container: {
    display: 'inline-block'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  h2: {
    margin: '0 0 10px 0'
  },
  input: {
    ...rowStyle.container,
    float: 'left'
  },
  chartArea: {
    flexGrow: 1
  },
  placeholderContainer: {
    position: 'relative',
    height: '100%',
    textAlign: 'center',
    backgroundImage: `url('${placeholderImage}')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
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

export const UnconnectedVisualizerModal = VisualizerModal;
export default connect(state => ({
  tableColumns: state.data.tableColumns || [],
  tableRecords: state.data.tableRecords || [],
  tableName: state.data.tableName || ''
}))(VisualizerModal);
