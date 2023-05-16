/* A single tutorial shown in TutorialExplorer.  Displays a thumbnail image, name, and some extra information.
 */

import PropTypes from 'prop-types';
import React from 'react';
import shapes from './shapes';
import {getTutorialDetailString} from './util';
import {getResponsiveValue} from './responsive';
import Image from './image';
import LazyLoad from 'react-lazy-load';

export default class Tutorial extends React.Component {
  static propTypes = {
    item: shapes.tutorial.isRequired,
    tutorialClicked: PropTypes.func.isRequired,
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
      width: getResponsiveValue({lg: 33.3333333, sm: 50, xs: 100}),
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
        data-tutorial-code={this.props.item.code}
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

const styles = {
  tutorialOuter: {
    float: 'left',
    padding: '7px 7px',
    cursor: 'pointer',
  },
  tutorialImageContainer: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '75%',
    borderRadius: '8px 8px 0 0',
  },
  tutorialImageBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    border: '1px solid rgb(162, 162, 162)',
    borderRadius: '8px 8px 0 0',
  },
  tutorialImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    borderRadius: '8px 8px 0 0',
    border: '1px solid rgb(162, 162, 162)',
  },
  tutorialName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    borderLeft: '1px solid rgb(162, 162, 162)',
    borderRight: '1px solid rgb(162, 162, 162)',
    padding: '8px 10px 0',
  },
  tutorialSub: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 12,
    lineHeight: '16px',
    height: 28,
    border: '1px solid rgb(162, 162, 162)',
    borderTop: 0,
    padding: '0px 10px 8px',
    borderRadius: '0 0 8px 8px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
};
