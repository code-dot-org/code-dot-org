import React, { Component } from "react";
import { styles } from "../constants.js";

class SpecifyColumnsInfo extends Component {
  render() {
    return (
      <div id="specify-columns-info" style={{...styles.panel, ...styles.rightPanel}}>
        <div style={styles.largeText}>Data Types</div>
        <div style={styles.mediumText}>
          Describe the data in each of your selected columns
        </div>
        <div style={styles.smallText}>
          Categorical columns contain a fixed number of possible values that
          indicate a group. For example, the column "Size" might contain
          categorical data such as "small", "medium" and "large".{" "}
        </div>
        <div style={styles.smallText}>
          Continuous columns contain a range of possible numerical values that
          could fall anywhere on a continuum. For example, the column "Height in
          inches" might contain continuous data such as "12", "11.25" and
          "9.07".{" "}
        </div>
        <div style={styles.smallText}>
          If the column contains anything other than categorical or continuous
          data, it's not going to work for training this type of machine
          learning model.
        </div>
      </div>
    );
  }
}

export default SpecifyColumnsInfo;
