import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ViewType, fullyLockedStageMapping } from '../stageLockRedux';
import { isHiddenFromState } from '../hiddenStageRedux';

const styles = {
  hidden: {
    display: 'none'
  }
};

// TODO - make sure desc is accurate. probably rename this
/**
 * When viewing a locked level group as a teacher, we want to be able to toggle
 * between what the student would see (a message about the level being locked)
 * and what the teacher would see (the questions + answers). We accomplish this
 * by having the server send down the locked-stage rendering, but having it be
 * hidden. This component moves both the locked stage message and content into
 * a new div, and then toggles which is visible.g
 */
const TeacherLevelGroup = React.createClass({
  propTypes: {
    isHidden: PropTypes.bool.isRequired,
    isLocked: PropTypes.bool.isRequired
  },

  componentDidMount() {
    // Show this element, as parent div (refs.lockMessage) now owns visibility
    $('#locked-stage').appendTo(this.refs.lockMessage).show();
    $('#hidden-stage').appendTo(this.refs.hiddenMessage).show();
    $('#level-body').appendTo(this.refs.content);

  },
  render() {
    const { isLocked, isHidden } = this.props;

    let visibleFrame = 2;
    if (isHidden) {
      visibleFrame = 1;
    } else if (isLocked) {
      visibleFrame = 0;
    }

    return (
      <div>
        <div style={(visibleFrame !== 0) && styles.hidden || {}} ref="lockMessage"/>
        <div style={(visibleFrame !== 1) && styles.hidden || {}} ref="hiddenMessage"/>
        <div style={(visibleFrame !== 2) && styles.hidden || {}} ref="content"/>
      </div>
    );
  }
});

export default connect(state => {
  const { viewAs } = state.stageLock;

  let isLocked = false;
  let isHidden = false;
  if (viewAs === ViewType.Student) {
    const { currentStageId } = state.progress;
    const { selectedSectionId } = state.sections;
    const hiddenStageMap = state.hiddenStage.get('bySection');

    const fullyLocked = fullyLockedStageMapping(state.stageLock.stagesBySectionId[selectedSectionId]);
    isLocked = !!fullyLocked[currentStageId];
    isHidden = isHiddenFromState(hiddenStageMap, selectedSectionId, currentStageId);
  }

  return {
    isHidden,
    isLocked
  };
})(TeacherLevelGroup);
