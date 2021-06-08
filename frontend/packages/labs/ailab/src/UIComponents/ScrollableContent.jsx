import PropTypes from "prop-types";
import React, { Component } from "react";
import { styles } from "../constants";

export default class ScrollableContent extends Component {
  static propTypes = {
    tinted: PropTypes.bool,
    children: PropTypes.node
  };

  render() {
    const { tinted, children } = this.props;

    return (
      <div
        style={
          tinted ? styles.scrollableContentsTinted : styles.scrollableContents
        }
      >
        <div style={styles.scrollingContents}>{children}</div>
      </div>
    );
  }
}
