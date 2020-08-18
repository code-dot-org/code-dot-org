/* A single tutorial shown in TutorialExplorer.  Displays a thumbnail image, name, and some extra information.
 */

import PropTypes from 'prop-types';
import React from 'react';
import shapes from './shapes';
import {getTutorialDetailString} from './util';
import {getResponsiveValue} from './responsive';
import Image from './image';
import LazyLoad from 'react-lazy-load';

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
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '75%'
  },
  tutorialImageBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    border: 'solid 1px #cecece'
  },
  tutorialImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
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
    lineHeight: '16px',
    height: 40
  }
};

export default class Tutorial extends React.Component {
  static propTypes = {
    item: shapes.tutorial.isRequired,
    tutorialClicked: PropTypes.func.isRequired
  };

  keyboardSelectTutorial = event => {
    if (event.keyCode === 32 || event.keyCode === 13) {
      event.preventDefault();
      this.props.tutorialClicked();
    }
  };

  render() {
    const tutorialOuterStyle = {
      ...styles.tutorialOuter,
      width: getResponsiveValue({lg: 33.3333333, sm: 50, xs: 100})
    };

    const imageSrc = this.props.item.image
      .replace('/images/', '/images/fill-480x360/')
      .replace('.png', '.jpg');

    return (
      <div
        style={tutorialOuterStyle}
        onClick={this.props.tutorialClicked}
        onKeyDown={this.keyboardSelectTutorial}
        tabIndex="0"
        role="button"
      >
        <div style={styles.tutorialImageContainer}>
          <div style={styles.tutorialImageBackground} />
          <LazyLoad offset={1000}>
            <Image src={imageSrc} style={styles.tutorialImage} alt="" />
          </LazyLoad>
        </div>
        <div style={styles.tutorialName}>{this.props.item.name}</div>
        <div style={styles.tutorialSub}>
          {getTutorialDetailString(this.props.item)}
        </div>
      </div>
    );
  }
}
