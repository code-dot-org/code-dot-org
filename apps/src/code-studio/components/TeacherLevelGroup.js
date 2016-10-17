import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Radium from 'radium';
import { connect } from 'react-redux';
import { ViewType, fullyLockedStageMapping } from '../stageLockRedux';

const styles = {
  hidden: {
    display: 'none'
  }
};

/**
 * When viewing a locked level group as a teacher, we want to be able to toggle
 * between what the student would see (a message about the level being locked)
 * and what the teacher would see (the questions + answers). We accomplish this
 * by having the server send down the locked-stage rendering, but having it be
 * hidden. This component moves both the locked stage message and content into
 * a new div, and then toggles which is visible.g
 */
const TeacherLevelGroup = Radium(React.createClass({
  propTypes: {
    isLocked: PropTypes.bool.isRequired
  },

  componentDidMount() {
    const lockMessage = ReactDOM.findDOMNode(this.refs.lockMessage);
    const content = ReactDOM.findDOMNode(this.refs.content);

    $('#locked-stage').appendTo(lockMessage).show();
    $('.level-group').appendTo(content);
  },
  render() {
    const { isLocked } = this.props;
    return (
      <div>
        <div style={[!isLocked && styles.hidden]} ref="lockMessage"/>
        <div style={[isLocked && styles.hidden]} ref="content"/>
      </div>
    );
  }
}));

export default connect(state => {
  const { viewAs } = state.stageLock;
  let isLocked = false;
  if (viewAs === ViewType.Student) {
    const { currentStageId } = state.progress;
    const { selectedSectionId } = state.sections;
    const fullyLocked = fullyLockedStageMapping(state.stageLock.stagesBySectionId[selectedSectionId]);
    isLocked = fullyLocked[currentStageId];
  }

  return { isLocked };
})(TeacherLevelGroup);
