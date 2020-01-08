import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {connect} from 'react-redux';
import {
  getCurrentScriptData,
  scriptDataPropType
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/scriptSelectionRedux';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StandardsIntroDialog from './StandardsIntroDialog';
import StandardsProgressTable from './StandardsProgressTable';
import StandardsLegend from './StandardsLegend';

class StandardsView extends Component {
  static propTypes = {
    showStandardsIntroDialog: PropTypes.bool,
    //redux
    section: sectionDataPropType.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType
  };

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
  }

  render() {
    const {scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    return (
      <div>
        <StandardsIntroDialog isOpen={this.props.showStandardsIntroDialog} />
        <StandardsProgressTable />
        <StandardsLegend />
        <div id="test-how-to-standards">
          <h3>{i18n.standardsHowTo()}</h3>
          <SafeMarkdown
            openExternalLinksInNewTab={true}
            markdown={i18n.standardsHowToDetails({
              courseName: scriptFriendlyName,
              courseLink: linkToOverview,
              cstaLink: 'https://www.csteachers.org/page/standards'
            })}
          />
          <h3>{i18n.standardsGetInvolved()}</h3>
          <SafeMarkdown
            markdown={i18n.standardsGetInvolvedDetails({
              adminLink: pegasus('/administrator'),
              parentLink: pegasus('/help'),
              teacherLink: '/courses'
            })}
          />
        </div>
      </div>
    );
  }
}

export const UnconnectedStandardsView = StandardsView;

export default connect(state => ({
  section: state.sectionData.section,
  scriptData: getCurrentScriptData(state),
  scriptFriendlyName: getSelectedScriptFriendlyName(state)
}))(StandardsView);
