import React from 'react';
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
    marginLeft: 15
  },
  arrowBox: {
    float: "right",
    marginTop: 12,
    marginRight: 25,
    height: 40,
    width: 90,
    borderColor: color.white,
    borderWidth: 1,
    borderRadius: 3,
    borderStyle: "solid"
  },
  arrowBoxRight: {
    marginTop: 25,
    marginRight: 25
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
    const announcements = this.props.children;
    return { previous: announcements.length-1, current: 0, next: 1  };
  },

  toNext() {
    const announcements = this.props.children;

    if (this.state.current < announcements.length-1) {
      this.setState({previous: this.state.current, current: this.state.next, next: this.state.next + 1 });
    }
    if (this.state.current === announcements.length-1) {
      this.setState({previous: this.state.current, current: 0, next: 1});
    }
  },

  toPrevious() {
    const announcements = this.props.children;
    if (this.state.current === 0) {
      this.setState({previous: announcements.length-2, current: announcements.length-1, next: 0});
    } else if  (this.state.current === 1) {
      this.setState({previous: 0, current: this.state.previous, next: announcements.length-1});
    } else if (this.state.current <= announcements.length-1 ) {
      this.setState({previous: this.state.current-2, current: this.state.current-1, next: this.state.current});
    }
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
        {announcements[this.state.current]}
      </div>
    );
  }
});

export default AnnouncementsCarousel;
