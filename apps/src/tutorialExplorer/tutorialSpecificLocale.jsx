/* A single tutorial shown in TutorialExplorer when listed for a specific locale,
 * which will be non-English.
 * Displays a thumbnail image, name, organization, and some extra information.
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
    width: '33.3333%',
    height: 0,
    paddingTop: '25%',
    float: 'left'
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
  tutorialTextContainer: {
    paddingLeft: 10,
    float: 'left',
    width: '66.666%'
  },
  tutorialName: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  tutorialSub: {
    fontFamily: '"Gotham 3r", sans-serif',
    fontSize: 14
  }
};

export default class TutorialLocaleSpecific extends React.Component {
  static propTypes = {
    item: shapes.tutorial.isRequired,
    tutorialClicked: PropTypes.func.isRequired
  };

  render() {
    const tutorialOuterStyle = {
      ...styles.tutorialOuter,
      width: getResponsiveValue({lg: 50, sm: 100, xs: 100})
    };

    const imageSrc = this.props.item.image
      .replace('/images/', '/images/fill-480x360/')
      .replace('.png', '.jpg');

    return (
      <div style={tutorialOuterStyle} onClick={this.props.tutorialClicked}>
        <div style={styles.tutorialImageContainer}>
          <div style={styles.tutorialImageBackground} />
          <LazyLoad offset={1000}>
            <Image src={imageSrc} style={styles.tutorialImage} />
          </LazyLoad>
        </div>
        <div style={styles.tutorialTextContainer}>
          <div style={styles.tutorialName}>{this.props.item.name}</div>
          <div style={styles.tutorialSub}>{this.props.item.orgname}</div>
          <div style={styles.tutorialSub}>
            {getTutorialDetailString(this.props.item)}
          </div>
        </div>
      </div>
    );
  }
}
