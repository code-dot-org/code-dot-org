import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import CourseProgress from './CourseProgress';
import MiniViewTopRow from './MiniViewTopRow';
import experiments from '@cdo/apps/util/experiments';

const progressRedesignEnabled = experiments.isEnabled('progressRedesign');

const styles = {
  // We want a margin for the non-redesigned course progress
  oldCourseProgress: {
    marginLeft: 10,
    marginRight: 10
  }
};

/**
 * The course progress dropdown you get when you click the arrow in the header.
 */
const MiniView = React.createClass({
  propTypes: {
    linesOfCodeText: PropTypes.string.isRequired,

    // redux backed
    scriptName: PropTypes.string.isRequired,
    hasFullProgress: PropTypes.bool.isRequired
  },

  render() {
    const { linesOfCodeText, scriptName, hasFullProgress } = this.props;

    let body;
    if (!hasFullProgress) {
      // Ideally we would specify inline CSS instead of using a classname here,
      // but the image used here gets digested by rails, and we don't know the
      // digested path
      body = <div className="loading"/>;
    } else {
      body = (
        <div style={progressRedesignEnabled ? undefined : styles.oldCourseProgress}>
          <CourseProgress onOverviewPage={false}/>
        </div>
      );
    }

    return (
      <div>
        <MiniViewTopRow
          scriptName={scriptName}
          linesOfCodeText={linesOfCodeText}
        />
        {body}
      </div>
    );
  }
});

export const UnconnectedMiniView = MiniView;

export default connect(state => ({
  scriptName: state.progress.scriptName,
  hasFullProgress: state.progress.hasFullProgress,
}))(MiniView);
