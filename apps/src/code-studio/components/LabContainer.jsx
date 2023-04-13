// LabContainer
//
// This React component is used to contain a lab that doesn't need page reloads
// between levels.
//
// For now, it's only used for the "music" app, and facilitates instant switching
// between "music" levels in the same lesson.
//
// It plays a fade-in animation when levels are switched.

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import moduleStyles from './LabContainer.module.scss';

class UnconnectedLabContainer extends Component {
  static propTypes = {
    currentLevelId: PropTypes.string,
    children: PropTypes.node.isRequired
  };

  render() {
    return (
      <div id="lab-container" className={moduleStyles.labContainer}>
        {this.props.children}
        <div
          id="fade-overlay"
          key={this.props.currentLevelId}
          className={moduleStyles.fadeInBlock}
        />
      </div>
    );
  }
}

const LabContainer = connect(state => ({
  currentLevelId: state.progress.currentLevelId
}))(UnconnectedLabContainer);

export default LabContainer;
