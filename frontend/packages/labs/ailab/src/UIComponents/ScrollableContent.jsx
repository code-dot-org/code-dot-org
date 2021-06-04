import PropTypes from "prop-types";
import React, { Component } from "react";
import { styles } from "../constants";
//import _ from "lodash";

export default class ScrollableContent extends Component {
  static propTypes = {
    tinted: PropTypes.bool,
    children: PropTypes.node
  };

  state = {
    showVignette: false
  };

  isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => {
    return scrollHeight > clientHeight || scrollWidth > clientWidth;
  };

  atBottom = ({ scrollHeight, scrollTop, clientHeight }) => {
    return scrollHeight - scrollTop - clientHeight < 1;
  };

  componentDidMount() {
    this.updateVignette();

    this.animationTimer = setInterval(
      this.updateVignette.bind(this),
      1000 / 5
    );
  }

  componentWillUnmount() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
    }
  }

  updateVignette = () => {
    this.setState({
      showVignette:
        this.isOverflown(this.refs.scrollingContents) &&
        !this.atBottom(this.refs.scrollingContents)
    });
  };

  render() {
    const { tinted, children } = this.props;

    return (
      <div
        style={
          tinted ? styles.scrollableContentsTinted : styles.scrollableContents
        }
      >
        <div style={styles.scrollingContents} ref="scrollingContents">
          {children}
        </div>
        {this.state.showVignette && (
          <div
            id="vignette"
            style={tinted ? styles.vignetteTinted : styles.vignette}
          />
        )}
      </div>
    );
  }
}
