import React from 'react';
import Radium from 'radium';
import FontAwesome from '../FontAwesome';
import color from "../../util/color";
import _ from 'lodash';

const styles = {
  box: {
    width: 940,
    backgroundColor: color.white
  },
  arrowIcon: {
    fontSize: 40,
    lineHeight: "40px",
    color: color.white,
    marginRight: 15,
    marginLeft: 15,
    ':hover': {
      color: color.lightest_gray,
      cursor: 'pointer',
    },
  },
  arrowBox: {
    float: "right",
    marginTop: 12,
    marginRight: 25,
    height: 40,
    width: 90,
    borderColor: color.white,
    borderWidth: 1,
    borderStyle: "solid",
  },
};

const AnnouncementsCarousel = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ])
  },

  getInitialState() {
    return {currentIndex: 0};
  },

  toNext() {
    const announcements = this.props.children;
    const nextIndex = (this.state.currentIndex + 1 + announcements.length) % announcements.length;
    this.setState({currentIndex: nextIndex});
  },

  toPrevious() {
    const announcements = this.props.children;
    const nextIndex = (this.state.currentIndex - 1 + announcements.length) % announcements.length;
    this.setState({currentIndex: nextIndex});
  },

  render() {
    const announcements = _.isArray(this.props.children) ? this.props.children : [this.props.children];

    return (
      <div style={styles.box}>
        {announcements.length > 1 &&
          <div style={styles.arrowBox}>
            <FontAwesome
              style={styles.arrowIcon}
              onClick={this.toPrevious}
              icon="caret-left"
            />
            <FontAwesome
              style={styles.arrowIcon}
              onClick={this.toNext}
              icon="caret-right"
            />
          </div>
        }
        {announcements[this.state.currentIndex]}
      </div>
    );
  }
});

export default Radium(AnnouncementsCarousel);
