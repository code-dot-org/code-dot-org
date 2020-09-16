import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

import * as teacherCodeCommentPropTypes from './propTypes';

const styles = {
  container: {
    backgroundColor: color.lightest_gray,
    border: '1px solid ' + color.light_gray,
    borderRadius: 3,
    padding: 10,
    position: 'absolute',
    zIndex: 9999
  },
  stem: {
    borderBottom: '8px solid transparent',
    borderRight: '8px solid ' + color.lightest_gray,
    borderTop: '8px solid transparent',
    height: 0,
    left: -8,
    position: 'absolute',
    top: 10,
    width: 0
  },
  stemBorder: {
    borderBottom: '9px solid transparent',
    borderRight: '9px solid ' + color.light_gray,
    borderTop: '9px solid transparent',
    height: 0,
    left: -9,
    position: 'absolute',
    top: 9,
    width: 0
  }
};

export default class LineNumberDialog extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    position: teacherCodeCommentPropTypes.position.isRequired
  };

  render() {
    // offset from target element to align with stem
    const offsetPosition = {
      left: this.props.position.left + 8,
      top: this.props.position.top - 20
    };

    return (
      <div
        style={{
          ...offsetPosition,
          ...styles.container
        }}
      >
        <div style={styles.stemBorder} />
        <div style={styles.stem} />
        <div>{this.props.children}</div>
      </div>
    );
  }
}
