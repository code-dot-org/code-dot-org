/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentColumn, setHighlightColumn } from "../redux";
import { styles } from "../constants";

class DataTable extends Component {
  static propTypes = {
    data: PropTypes.array,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    setCurrentColumn: PropTypes.func,
    setHighlightColumn: PropTypes.func,
    currentColumn: PropTypes.string,
    highlightColumn: PropTypes.string,
    setColumnRef: PropTypes.func,
    reducedColumns: PropTypes.bool,
    singleRow: PropTypes.number,
    startingRow: PropTypes.number
  };

  getColumnHeaderStyle = key => {
    let style;

    if (key === this.props.currentColumn) {
      if (key === this.props.labelColumn) {
        style = styles.dataDisplayHeaderLabelSelected;
      } else if (this.props.selectedFeatures.includes(key)) {
        style = styles.dataDisplayHeaderFeatureSelected;
      } else {
        style = styles.dataDisplayHeaderSelected;
      }
    } else if (key === this.props.highlightColumn) {
      if (key === this.props.labelColumn) {
        style = styles.dataDisplayHeaderLabelUnselected;
      } else if (this.props.selectedFeatures.includes(key)) {
        style = styles.dataDisplayHeaderFeatureUnselected;
      } else {
        style = styles.dataDisplayHeaderHighlighted;
      }
    } else {
      if (key === this.props.labelColumn) {
        style = styles.dataDisplayHeaderLabelUnselected;
      } else if (this.props.selectedFeatures.includes(key)) {
        style = styles.dataDisplayHeaderFeatureUnselected;
      } else {
        style = styles.dataDisplayHeaderUnselected;
      }
    }

    return { ...style, ...styles.tableHeader };
  };

  getColumnCellStyle = key => {
    let style;

    if (key === this.props.currentColumn) {
      if (key === this.props.labelColumn) {
        style = styles.dataDisplayCellLabelSelected;
      } else if (this.props.selectedFeatures.includes(key)) {
        style = styles.dataDisplayCellFeatureSelected;
      } else {
        style = styles.dataDisplayCellSelected;
      }
    } else if (key === this.props.highlightColumn) {
      if (key === this.props.labelColumn) {
        style = styles.dataDisplayCellLabelUnselected;
      } else if (this.props.selectedFeatures.includes(key)) {
        style = styles.dataDisplayCellFeatureUnselected;
      } else {
        style = styles.dataDisplayCellHighlighted;
      }
    } else {
      if (key === this.props.labelColumn) {
        style = styles.dataDisplayCellLabelUnselected;
      } else if (this.props.selectedFeatures.includes(key)) {
        style = styles.dataDisplayCellFeatureUnselected;
      } else {
        style = styles.dataDisplayCellUnselected;
      }
    }

    return { ...style, ...styles.tableCell };
  };

  getColumns = () => {
    if (this.props.reducedColumns) {
      return Object.keys(this.props.data[0]).filter(key => {
        return (
          this.props.labelColumn === key ||
          this.props.selectedFeatures.includes(key)
        );
      });
    }

    return Object.keys(this.props.data[0]);
  };

  getRows = () => {
    if (this.props.singleRow !== undefined) {
      return [this.props.data[this.props.singleRow]];
    } else if (this.props.startingRow !== undefined) {
      return this.props.data.slice(this.props.startingRow, 100);
    } else {
      return this.props.data;
    }
  }

  render() {
    const {
      data,
      setCurrentColumn,
      setColumnRef,
      setHighlightColumn
    } = this.props;

    if (data.length === 0) {
      return null;
    }

    return (
      <table style={styles.displayTable}>
        <thead>
          <tr>
            {this.getColumns().map(key => {
              return (
                <th
                  key={key}
                  style={this.getColumnHeaderStyle(key)}
                  onClick={() => setCurrentColumn(key)}
                  ref={ref => setColumnRef && setColumnRef(key, ref)}
                  onMouseEnter={() => setHighlightColumn(key)}
                  onMouseLeave={() => setHighlightColumn(undefined)}
                >
                  {key}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {this.getRows().map((row, index) => {
            return (
              <tr key={index}>
                {this.getColumns().map(key => {
                  return (
                    <td
                      key={key}
                      style={this.getColumnCellStyle(key)}
                      onClick={() => setCurrentColumn(key)}
                      onMouseEnter={() => setHighlightColumn(key)}
                      onMouseLeave={() => setHighlightColumn(undefined)}
                    >
                      {row[key]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default connect(
  state => ({
    data: state.data,
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    currentColumn: state.currentColumn,
    highlightColumn: state.highlightColumn
  }),
  dispatch => ({
    setCurrentColumn(column) {
      dispatch(setCurrentColumn(column));
    },
    setHighlightColumn(column) {
      dispatch(setHighlightColumn(column));
    }
  })
)(DataTable);
