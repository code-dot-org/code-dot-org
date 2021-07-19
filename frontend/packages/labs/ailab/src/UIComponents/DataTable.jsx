/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getTableData, setCurrentColumn, setHighlightColumn } from "../redux";
import { styles } from "../constants";

class DataTable extends Component {
  static propTypes = {
    currentPanel: PropTypes.string,
    data: PropTypes.array,
    labelColumn: PropTypes.string,
    selectedFeatures: PropTypes.array,
    setCurrentColumn: PropTypes.func,
    setHighlightColumn: PropTypes.func,
    currentColumn: PropTypes.string,
    highlightColumn: PropTypes.string,
    reducedColumns: PropTypes.bool,
    singleRow: PropTypes.number,
    startingRow: PropTypes.number,
    noLabel: PropTypes.bool,
    hideLabel: PropTypes.bool
  };

  getColumnHeaderStyle = key => {
    let style;

    if (key === this.props.labelColumn) {
      style = styles.dataDisplayHeaderLabel;
    } else if (this.props.selectedFeatures.includes(key)) {
      style = styles.dataDisplayHeaderFeature;
    }

    const pointerStyle =
      !this.props.reducedColumns && styles.dataDisplayHeaderClickable;

    return { ...styles.dataDisplayHeader, ...pointerStyle, ...style };
  };

  getColumnCellStyle = key => {
    let style;

    if (this.props.hideLabel && this.props.labelColumn === key) {
      style = styles.dataDisplayCellHidden;
    } else if (key === this.props.currentColumn) {
      if (this.props.currentPanel === "dataDisplayLabel") {
        style = styles.dataDisplayCellSelectedLabel;
      } else {
        style = styles.dataDisplayCellSelected;
      }
    } else if (key === this.props.highlightColumn) {
      if (this.props.currentPanel === "dataDisplayLabel") {
        style = styles.dataDisplayCellHighlightedLabel;
      } else {
        style = styles.dataDisplayCellHighlighted;
      }
    }

    return { ...styles.dataDisplayCell, ...style };
  };

  getColumns = () => {
    if (this.props.reducedColumns) {
      return Object.keys(this.props.data[0])
        .filter(key => {
          return (
            (!this.props.noLabel && this.props.labelColumn === key) ||
            this.props.selectedFeatures.includes(key)
          );
        })
        .sort((key1, key2) => {
          return this.props.labelColumn === key1 ? 1 : -1;
        });
    }

    return Object.keys(this.props.data[0]);
  };

  getRows = () => {
    if (this.props.singleRow !== undefined) {
      return [
        this.props.data[
          Math.min(this.props.singleRow, this.props.data.length - 1)
        ]
      ];
    } else {
      return this.props.data.slice(0, 100);
    }
  };

  setCurrentColumn = columnId => {
    if (!this.props.reducedColumns) {
      this.props.setCurrentColumn(columnId);
    }
  };

  setHighlightColumn = columnId => {
    if (!this.props.reducedColumns) {
      this.props.setHighlightColumn(columnId);
    }
  };

  render() {
    const { data, startingRow } = this.props;

    if (data.length === 0) {
      return null;
    }

    return (
      <table style={styles.displayTable}>
        <thead>
          <tr>
            {this.getColumns().map(columnId => {
              return (
                <th
                  key={columnId}
                  style={this.getColumnHeaderStyle(columnId)}
                  onClick={() => this.setCurrentColumn(columnId)}
                  onKeyDown={() => this.setCurrentColumn(columnId)}
                  onMouseEnter={() => this.setHighlightColumn(columnId)}
                  onMouseLeave={() => this.setHighlightColumn(undefined)}
                >
                  {columnId}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {this.getRows().map((row, index) => {
            return (
              <tr key={index}>
                {this.getColumns().map(columnId => {
                  return (
                    <td
                      key={columnId}
                      className="uitest-data-table-column"
                      style={this.getColumnCellStyle(columnId)}
                      onClick={() => this.setCurrentColumn(columnId)}
                      onKeyDown={() => this.setCurrentColumn(columnId)}
                      onMouseEnter={() => this.setHighlightColumn(columnId)}
                      onMouseLeave={() => this.setHighlightColumn(undefined)}
                      role="presentation"
                    >
                      {startingRow !== undefined && index <= startingRow ? (
                        <span>&nbsp;</span>
                      ) : (
                        row[columnId]
                      )}
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
  (state, props) => ({
    data: getTableData(state, props.useResultsData),
    labelColumn: state.labelColumn,
    selectedFeatures: state.selectedFeatures,
    currentColumn: state.currentColumn,
    highlightColumn: state.highlightColumn,
    currentPanel: state.currentPanel
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
