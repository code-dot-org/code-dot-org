import PropTypes from "prop-types";
import React, { Component } from "react";
import { styles } from "../constants";

export default class ScrollableContent extends Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    const { children } = this.props;

    return (
      <div style={styles.scrollableContents}>
        <div style={styles.scrollingContents}>{children}</div>
      </div>
    );
  }
}
