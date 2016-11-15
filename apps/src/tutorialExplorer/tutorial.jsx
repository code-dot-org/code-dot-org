/* A single tutorial shown in TutorialExplorer.  Displays a thumbnail image, name, and some extra information.
 */

import React from 'react';
import TutorialDetail from './tutorialDetail';
import shapes from './shapes';
import { getTutorialDetailString } from './util';
import { getResponsiveValue } from './responsive';

const styles = {
  tutorialOuter: {
    float: 'left',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 7,
    paddingRight: 7,
    cursor: 'pointer'
  },
  tutorialImageContainer: {
    position: "relative",
    width: "100%",
    height: 0,
    paddingTop: "75%"
  },
  tutorialImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%"
  },
  tutorialName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  tutorialSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 12,
    lineHeight: "16px",
    height: 40
  }
};

const Tutorial = React.createClass({
  propTypes: {
    item: shapes.tutorial.isRequired,
    localeEnglish: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showingDetail: false
    };
  },

  tutorialClicked() {
    this.setState({showingDetail: true});
  },

  tutorialDetailClosed() {
    this.setState({showingDetail: false});
  },

  render() {
    const tutorialOuterStyle = {
      ...styles.tutorialOuter,
      width: getResponsiveValue({lg: 33.3333333, sm: 50, xs: 100})
    };

    return (
      <div>
        <TutorialDetail
          showing={this.state.showingDetail}
          item={this.props.item}
          closeClicked={this.tutorialDetailClosed}
          localeEnglish={this.props.localeEnglish}
        />
        <div
          style={tutorialOuterStyle}
          onClick={this.tutorialClicked}
        >
          <div style={styles.tutorialImageContainer}>
            <img
              src={this.props.item.image.replace("/images/", "/images/fill-480x360/").replace(".png", ".jpg")}
              style={styles.tutorialImage}
            />
          </div>
          <div style={styles.tutorialName}>
            {this.props.item.name}
          </div>
          <div style={styles.tutorialSub}>
            {getTutorialDetailString(this.props.item)}
          </div>
        </div>
      </div>
    );
  }
});

export default Tutorial;
