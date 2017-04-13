import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import CourseProgress from './CourseProgress';
import MiniViewTopRow from './MiniViewTopRow';
import { hasGroups } from '@cdo/apps/code-studio/progressRedux';
import experiments from '@cdo/apps/util/experiments';

const progressRedesignEnabled = experiments.isEnabled('progressRedesign');

const styles = {
  // For our non-redesigned view, we want margins on the left and right
  oldProgress: {
    marginLeft: 10,
    marginRight: 10
  },
  // For the detail view (without groups) we want some margins
  detailView: {
    margin: 10
  },
  // For group view, we want larger margins to match the gap between groups
  groupView: {
    margin: 20
  }
};

/**
 * The course progress dropdown you get when you click the arrow in the header.
 */
const MiniView = React.createClass({
  propTypes: {
    linesOfCodeText: PropTypes.string,

    // redux backed
    isSummaryView: PropTypes.bool.isRequired,
    hasGroups: PropTypes.bool.isRequired,
    scriptName: PropTypes.string.isRequired,
    hasFullProgress: PropTypes.bool.isRequired,
  },

  render() {
    const { linesOfCodeText, isSummaryView, hasGroups, scriptName, hasFullProgress } = this.props;

    let body;
    if (!hasFullProgress) {
      // Ideally we would specify inline CSS instead of using a classname here,
      // but the image used here gets digested by rails, and we don't know the
      // digested path
      body = <div className="loading"/>;
    } else {
      body = (
        <div
          style={{
            ...(!progressRedesignEnabled && styles.oldProgress),
            ...(progressRedesignEnabled && !hasGroups && !isSummaryView && styles.detailView),
            ...(progressRedesignEnabled && hasGroups && styles.groupView)
          }}
        >
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
  isSummaryView: state.progress.isSummaryView,
  scriptName: state.progress.scriptName,
  hasFullProgress: state.progress.hasFullProgress,
  hasGroups: hasGroups(state.progress)
}))(MiniView);
