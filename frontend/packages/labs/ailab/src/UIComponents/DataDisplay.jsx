/* React component to handle displaying imported data. */
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import Statement from "./Statement";
import DataTable from "./DataTable";
import { styles } from "../constants";
import I18n from "../i18n";

class DataDisplay extends Component {
  static propTypes = {
    data: PropTypes.array
  };

  render() {
    const { data } = this.props;

    if (data.length === 0) {
      return null;
    }

    const rowCount = this.props.data.length;
    const rowLimit = 100;
    const rowCountMessage = (rowCount <= rowLimit) ?
      I18n.t("dataDisplayRowCount", {"rowCount": rowCount}) :
      I18n.t("dataDisplayRowCountTruncated", {"rowCount": rowCount, "rowLimit": rowLimit});
    return (
      <div id="data-display" style={styles.panel}>
        <Statement />
        <div style={styles.tableParent}>
          <DataTable />
        </div>
        <div style={styles.footerText}>
          {rowCountMessage}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    data: state.data
  })
)(DataDisplay);
