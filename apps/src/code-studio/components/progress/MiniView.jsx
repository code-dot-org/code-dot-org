import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import UnitOverview from './UnitOverview';
import MiniViewTopRow from './MiniViewTopRow';
import {hasGroups} from '@cdo/apps/code-studio/progressRedux';

/**
 * The course progress dropdown you get when you click the arrow in the header.
 */
class MiniView extends React.Component {
  static propTypes = {
    linesOfCodeText: PropTypes.string,
    minimal: PropTypes.bool,

    // redux backed
    isSummaryView: PropTypes.bool.isRequired,
    hasGroups: PropTypes.bool.isRequired,
    scriptName: PropTypes.string.isRequired,
    hasFullProgress: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string
  };

  render() {
    const {
      linesOfCodeText,
      isSummaryView,
      hasGroups,
      scriptName,
      hasFullProgress,
      selectedSectionId,
      minimal
    } = this.props;

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
            ...(hasGroups && styles.groupView)
          }}
        >
          <UnitOverview
            onOverviewPage={false}
            excludeCsfColumnInLegend={false}
            teacherResources={[]}
            minimal={minimal}
          />
        </div>
      );
    }

    return (
      <div>
        {!minimal && (
          <MiniViewTopRow
            scriptName={scriptName}
            linesOfCodeText={linesOfCodeText}
            selectedSectionId={selectedSectionId}
          />
        )}
        {body}
      </div>
    );
  }
}

const styles = {
  // For the detail view (without groups) we want some margins
  detailView: {
    margin: 10
  },
  // For group view, we want larger margins to match the gap between groups
  groupView: {
    margin: 20
  }
};

export const UnconnectedMiniView = MiniView;

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
  scriptName: state.progress.scriptName,
  hasFullProgress: state.progress.hasFullProgress,
  hasGroups: hasGroups(state.progress),
  selectedSectionId: state.teacherSections.selectedSectionId.toString()
}))(MiniView);
