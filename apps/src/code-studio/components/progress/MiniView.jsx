import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {hasGroups} from '@cdo/apps/code-studio/progressReduxSelectors';
import GoogleClassroomAttributionLabel from '@cdo/apps/templates/progress/GoogleClassroomAttributionLabel';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';

import MiniViewTopRow from './MiniViewTopRow';

/**
 * The course progress dropdown you get when you click the arrow in the header.
 */
function MiniView(props) {
  const {
    isSummaryView,
    hasGroups,
    scriptName,
    hasFullProgress,
    selectedSectionId,
    minimal,
  } = props;

  let body;
  if (!hasFullProgress) {
    // Ideally we would specify inline CSS instead of using a classname here,
    // but the image used here gets digested by rails, and we don't know the
    // digested path
    body = <div className="loading" style={{height: minimal ? 100 : 400}} />;
  } else {
    body = (
      <div
        className="mini-view"
        style={{
          ...(!hasGroups && !isSummaryView && styles.detailView),
          ...(hasGroups && styles.groupView),
        }}
      >
        <ProgressTable minimal={minimal} />
        <GoogleClassroomAttributionLabel />
      </div>
    );
  }

  return (
    <div>
      {!minimal && (
        <MiniViewTopRow
          scriptName={scriptName}
          selectedSectionId={selectedSectionId}
        />
      )}
      {body}
    </div>
  );
}

MiniView.propTypes = {
  minimal: PropTypes.bool,

  // redux backed
  isSummaryView: PropTypes.bool.isRequired,
  hasGroups: PropTypes.bool.isRequired,
  scriptName: PropTypes.string.isRequired,
  hasFullProgress: PropTypes.bool.isRequired,
  selectedSectionId: PropTypes.number,
};

const styles = {
  // For the detail view (without groups) we want some margins
  detailView: {
    margin: 10,
  },
  // For group view, we want larger margins to match the gap between groups
  groupView: {
    margin: 20,
  },
};

export const UnconnectedMiniView = MiniView;

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
  scriptName: state.progress.scriptName,
  hasFullProgress: state.progress.hasFullProgress,
  hasGroups: hasGroups(state.progress),
  selectedSectionId: state.teacherSections.selectedSectionId,
}))(MiniView);
