import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {getCurrentUnitData} from './sectionProgressRedux';
import {ViewType, scriptDataPropType} from './sectionProgressConstants';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/unitSelectionRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import color from '../../util/color';
import {h3Style} from '../../lib/ui/Headings';
import StandardsViewHeaderButtons from './standards/StandardsViewHeaderButtons';

class ProgressViewHeader extends Component {
  static propTypes = {
    scriptId: PropTypes.number,
    //redux
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    sectionId: PropTypes.number.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType,
  };

  getLinkToOverview() {
    const {scriptData, sectionId} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${sectionId}` : null;
  }

  navigateToScript = () => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_VIEWED, {
      sectionId: this.props.sectionId,
      unitId: this.props.scriptId,
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
          {headingText[currentView] + ' '}
          <a
            href={linkToOverview}
            style={styles.scriptLink}
            onClick={this.navigateToScript}
          >
            {scriptFriendlyName}
          </a>
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
