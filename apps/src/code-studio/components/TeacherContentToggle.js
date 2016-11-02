/* globals appOptions */

import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { ViewType, fullyLockedStageMapping } from '../stageLockRedux';
import { isHiddenFromState } from '../hiddenStageRedux';

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
    viewAs: PropTypes.string.isRequired,
    hiddenStagesInitialized: PropTypes.bool.isRequired,
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
    // Server initially sets level-body opacity to 0 when viewAs=Student so that
    // student view doesnt show content while we make async calls. Once this
    // component has mounted, we move level-body into our first div, which will
    // now own toggling visibility
    $('#level-body').css('opacity', '').appendTo(this.refs.content);
  },

  render() {
    const { viewAs, hiddenStagesInitialized, isLockedStage, isHiddenStage } = this.props;

    const frameStyle = {
      position: 'relative',
      zIndex: 1,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      height: window.screen.height
    };

    let contentStyle = {};
    let hasOverlayFrame = (isLockedStage || isHiddenStage);

    if (viewAs === ViewType.Student) {
      if (!hiddenStagesInitialized || hasOverlayFrame) {
        contentStyle.opacity = 0;
      }

      // In the case where appOptions.app is truthy, we don't want to actually set
      // display none, as that causes the editor (be it blockly or droplet) to
      // misrender. We can get away with just setting opacity = 0 because the editor
      // is rendered to an absolute position and doesnt affect the layout of this
      // component. For cases where we don't have an IDE (i.e. multi/match) we
      // need to hide such that it doesnt affect our layout
      if (hasOverlayFrame && !appOptions.app) {
        contentStyle.display = 'none';
      }
    }

    const showLockedStageMessage = isLockedStage && !isHiddenStage;
    const showHiddenStageMessage = isHiddenStage;

    // Note: This component depends on the fact that the only thing we change about
    // our children as we rerender is their style.
    return (
      <div>
        <div style={contentStyle} ref="content"/>
        <div style={[frameStyle, !showLockedStageMessage && styles.hidden]} ref="lockMessage"/>
        <div style={[frameStyle, !showHiddenStageMessage && styles.hidden]} ref="hiddenMessage"/>
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
    viewAs,
    hiddenStagesInitialized: state.hiddenStage.get('initialized'),
    isHiddenStage,
    isLockedStage
  };
})(TeacherContentToggle);
