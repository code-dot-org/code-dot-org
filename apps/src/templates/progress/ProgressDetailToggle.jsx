import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {setIsSummaryView} from '@cdo/apps/code-studio/progressRedux';
import {hasGroups} from '@cdo/apps/code-studio/progressReduxSelectors';
import harness from '@cdo/apps/lib/util/harness';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import ToggleGroup from '../ToggleGroup';

import groupDetailActive from './images/groupToggleDetailActive.png';
import groupDetailInactive from './images/groupToggleDetailInactive.png';
import groupSummaryActive from './images/groupToggleSummaryActive.png';
import groupSummaryInactive from './images/groupToggleSummaryInactive.png';
import detailActive from './images/toggleDetailActive.png';
import detailInactive from './images/toggleDetailInactive.png';
import summaryActive from './images/toggleSummaryActive.png';
import summaryInactive from './images/toggleSummaryInactive.png';

const imageSets = {
  teal: {
    summaryActive,
    summaryInactive,
    detailActive,
    detailInactive,
  },
  purple: {
    summaryActive: groupSummaryActive,
    summaryInactive: groupSummaryInactive,
    detailActive: groupDetailActive,
    detailInactive: groupDetailInactive,
  },
};

/**
 * A toggle that provides a way to switch between detail and summary views of
 * our course progress.
 */
class ProgressDetailToggle extends React.Component {
  static propTypes = {
    activeColor: PropTypes.string,
    whiteBorder: PropTypes.bool,
    toggleStudyGroup: PropTypes.string,

    // redux backed
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    hasGroups: PropTypes.bool.isRequired,
    setIsSummaryView: PropTypes.func.isRequired,
  };

  onChange = () => {
    const isSummaryView = !this.props.isSummaryView;
    this.recordEvent(isSummaryView);
    this.props.setIsSummaryView(isSummaryView);
  };

  recordEvent = isSummary => {
    harness.trackAnalytics(
      {
        study: 'progress-detail-toggle',
        study_group: this.props.toggleStudyGroup,
        event: isSummary ? 'see-summary' : 'see-detail',
      },
      {includeUserId: true}
    );
  };

  render() {
    const {whiteBorder, isSummaryView, hasGroups, isPlc} = this.props;

    let activeColor = this.props.activeColor;
    if (!activeColor) {
      activeColor = !isPlc && hasGroups ? color.purple : color.cyan;
    }

    const images =
      activeColor === color.purple ? imageSets.purple : imageSets.teal;
    return (
      <ToggleGroup
        selected={isSummaryView ? 'summary' : 'detail'}
        activeColor={activeColor}
        onChange={this.onChange}
      >
        <button
          type="button"
          value="summary"
          style={whiteBorder ? styles.whiteBorder : undefined}
        >
          <img
            src={isSummaryView ? images.summaryActive : images.summaryInactive}
            style={styles.icon}
            alt={i18n.summaryView()}
          />
        </button>
        <button
          type="button"
          value="detail"
          style={whiteBorder ? styles.whiteBorder : undefined}
          className="uitest-toggle-detail"
        >
          <img
            src={isSummaryView ? images.detailInactive : images.detailActive}
            style={styles.icon}
            alt={i18n.detailView()}
          />
        </button>
      </ToggleGroup>
    );
  }
}

const styles = {
  whiteBorder: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.white,
  },
  icon: {
    fontSize: 20,
    paddingLeft: 3,
    paddingRight: 3,
    paddingTop: 6,
    paddingBottom: 3,
    // If not set explicitly, css sets "button > img" to 0.6
    opacity: 1,
  },
};

export const UnconnectedProgressDetailToggle = ProgressDetailToggle;

export default connect(
  state => ({
    isPlc: !!state.progress.deeperLearningCourse,
    isSummaryView: state.progress.isSummaryView,
    hasGroups: hasGroups(state.progress),
  }),
  {setIsSummaryView}
)(ProgressDetailToggle);
