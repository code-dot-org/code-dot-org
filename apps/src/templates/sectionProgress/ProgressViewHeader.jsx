import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/unitSelectionRedux';
import i18n from '@cdo/locale';

import {h3Style} from '../../legacySharedComponents/Headings';
import firehoseClient from '../../metrics/firehose';
import color from '../../util/color';

import {ViewType, unitDataPropType} from './sectionProgressConstants';
import {getCurrentUnitData} from './sectionProgressRedux';
import StandardsViewHeaderButtons from './standards/StandardsViewHeaderButtons';

class ProgressViewHeader extends Component {
  static propTypes = {
    scriptId: PropTypes.number,
    //redux
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    sectionId: PropTypes.number.isRequired,
    scriptFriendlyName: PropTypes.string,
    scriptData: unitDataPropType,
  };

  getLinkToOverview() {
    const {scriptData, sectionId} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${sectionId}` : null;
  }

  navigateToScript = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_script',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId,
        }),
      },
      {includeUserId: true}
    );

    analyticsReporter.sendEvent(EVENTS.PROGRESS_VIEWED, {
      sectionId: this.props.sectionId,
      unitId: this.props.scriptId,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  };

  render() {
    const {currentView, scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    const headingText = {
      [ViewType.SUMMARY]: i18n.lessonsAttempted() + ' ',
      [ViewType.DETAIL]: i18n.levelsAttempted() + ' ',
      [ViewType.STANDARDS]: i18n.CSTAStandardsIn() + ' ',
    };
    return (
      <div style={{...h3Style, ...styles.heading, ...styles.tableHeader}}>
        <span>
          {headingText[currentView] + ' '}{' '}
          {scriptFriendlyName && (
            <a
              href={linkToOverview}
              style={styles.scriptLink}
              onClick={this.navigateToScript}
            >
              {scriptFriendlyName}
            </a>
          )}
        </span>
        {currentView === ViewType.STANDARDS && (
          <StandardsViewHeaderButtons sectionId={this.props.sectionId} />
        )}
      </div>
    );
  }
}

const styles = {
  heading: {
    marginBottom: 0,
  },
  tableHeader: {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scriptLink: {
    color: color.teal,
  },
};

export const UnconnectedProgressViewHeader = ProgressViewHeader;

export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
  currentView: state.sectionProgress.currentView,
  scriptData: getCurrentUnitData(state),
  scriptFriendlyName: getSelectedScriptFriendlyName(state),
}))(ProgressViewHeader);
