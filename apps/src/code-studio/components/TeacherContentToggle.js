import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { ViewType, fullyLockedStageMapping } from '../stageLockRedux';
import { isHiddenFromState } from '../hiddenStageRedux';
import { fireResizeEvent } from '@cdo/apps/utils';

const styles = {
  hidden: {
    display: 'none'
  }
};

// TODO - unit tests
// TODO - eyes tests
/**
 * When viewing a puzzle, we want teachers to be able to toggle between what the
 * student would see and what they see as a teacher. In some cases (such as
 * locked stages and hidden stages) this means hiding the main content, and
 * replacing it with something else.
 * We accomplish this by having the server render that other content to a known
 * dom element (#locked-stage, #hidden-stage). This component then creates
 * container elements for the main content and any other content, and toggles
 * which of those containers is visible as appropriate.
 */
const TeacherContentToggle = Radium(React.createClass({
  propTypes: {
    isHiddenStage: PropTypes.bool.isRequired,
    isLockedStage: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      sizeableContent: false
    };
  },

  componentDidMount() {
    // Show this element, as parent div (refs.lockMessage) now owns visibility
    $('#locked-stage').appendTo(this.refs.lockMessage).show();
    $('#hidden-stage').appendTo(this.refs.hiddenMessage).show();
    $('#level-body').appendTo(this.refs.content);

    // TODO - do we want to start content hidden in case we flip to locked/hidden?
    /*eslint-disable react/no-did-mount-set-state*/
    if ($(this.refs.content).height() > 0) {
      this.setState({sizeableContent: true});
    }
  },

  componentDidUpdate(nextProps) {
    fireResizeEvent();
  },

  render() {
    const { isLockedStage, isHiddenStage } = this.props;

    const frameStyle = {
      position: 'relative',
      zIndex: 1,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      height: window.screen.height
    };

    // For programming levels where we have an editor, everything is absolutely
    // positioned and takes up no height. In this case, we want to render it behind
    // any locked/hidden stage info rather than hide it so that it still sizes
    // itself correctly. Otherwise we just want to hide the content.
    const hideContent = (isLockedStage || isHiddenStage) && this.state.sizeableContent;

    return (
      <div>
        <div style={[hideContent && styles.hidden]} ref="content"/>
        <div style={[frameStyle, !isLockedStage && styles.hidden]} ref="lockMessage"/>
        <div style={[frameStyle, !isHiddenStage && styles.hidden]} ref="hiddenMessage"/>
      </div>
    );
  }
}));

export default connect(state => {
  const { viewAs } = state.stageLock;

  let isLockedStage = false;
  let isHiddenStage = false;
  if (viewAs === ViewType.Student) {
    const { currentStageId } = state.progress;
    const { selectedSectionId } = state.sections;
    const hiddenStageMap = state.hiddenStage.get('bySection');

    const fullyLocked = fullyLockedStageMapping(state.stageLock.stagesBySectionId[selectedSectionId]);
    isLockedStage = !!fullyLocked[currentStageId];
    isHiddenStage = isHiddenFromState(hiddenStageMap, selectedSectionId, currentStageId);
  }

  return {
    isHiddenStage,
    isLockedStage
  };
})(TeacherContentToggle);
