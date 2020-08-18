import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {getCurrentScriptData} from './sectionProgressRedux';
import {ViewType, scriptDataPropType} from './sectionProgressConstants';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/scriptSelectionRedux';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import firehoseClient from '../../lib/util/firehose';
import color from '../../util/color';
import {h3Style} from '../../lib/ui/Headings';
import StandardsViewHeaderButtons from './standards/StandardsViewHeaderButtons';

const styles = {
  heading: {
    marginBottom: 0
  },
  tableHeader: {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  scriptLink: {
    color: color.teal
  }
};

class ProgressViewHeader extends Component {
  static propTypes = {
    scriptId: PropTypes.number,
    //redux
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    section: sectionDataPropType.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType
  };

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
  }

  navigateToScript = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_script',
        data_json: JSON.stringify({
          section_id: this.props.section.id,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {currentView, scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    const headingText = {
      [ViewType.SUMMARY]: i18n.lessonsAttempted() + ' ',
      [ViewType.DETAIL]: i18n.levelsAttempted() + ' ',
      [ViewType.STANDARDS]: i18n.CSTAStandardsIn() + ' '
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
          <StandardsViewHeaderButtons sectionId={this.props.section.id} />
        )}
      </div>
    );
  }
}

export const UnconnectedProgressViewHeader = ProgressViewHeader;

export default connect(state => ({
  section: state.sectionData.section,
  currentView: state.sectionProgress.currentView,
  scriptData: getCurrentScriptData(state),
  scriptFriendlyName: getSelectedScriptFriendlyName(state)
}))(ProgressViewHeader);
