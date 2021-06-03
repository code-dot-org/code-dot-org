/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import Statement from "./Statement";
import DataTable from "./DataTable";
import { styles } from "../constants";

class DataDisplay extends Component {
  static propTypes = {
    data: PropTypes.array,
    removedRowsCount: PropTypes.number
  };

  render() {
    const { data, removedRowsCount } = this.props;
    const removedRowsMsg =
      removedRowsCount === 1
      ? `${this.props.removedRowsCount} row was removed because it contained an empty cell.`
      : `${this.props.removedRowsCount} rows were removed because they contained an empty cell.`;

    if (data.length === 0) {
      return null;
    }

    return (
      <div id="data-display" style={styles.panel}>
        <Statement />
        <div style={styles.tableParent}>
          <DataTable />
        </div>
        <div style={styles.footerText}>
          There are {this.props.data.length} rows of data.
          {removedRowsCount > 0 &&
            <span>
              &nbsp;
              {removedRowsMsg}
            </span>
          }
          {this.props.data.length > 100 &&
            <span>
              &nbsp;
              (Showing first 100 rows.)
            </span>
          }
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    data: state.data,
    removedRowsCount: state.removedRowsCount
  })
)(DataDisplay);
