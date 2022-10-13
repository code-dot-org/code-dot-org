import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {connect} from 'react-redux';
import {getCurrentUnitData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/unitSelectionRedux';
import StandardsIntroDialog from './StandardsIntroDialog';
import StandardsProgressTable from './StandardsProgressTable';
import StandardsLegend from './StandardsLegend';
import {cstaStandardsURL} from './standardsConstants';

class StandardsView extends Component {
  static propTypes = {
    showStandardsIntroDialog: PropTypes.bool,
    //redux
    sectionId: PropTypes.number.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType
  };

  getLinkToOverview() {
    const {scriptData, sectionId} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${sectionId}` : null;
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
              cstaLink: cstaStandardsURL
            })}
          />
          <h3>{i18n.standardsGetInvolved()}</h3>
          <SafeMarkdown
            markdown={i18n.standardsGetInvolvedDetails({
              adminLink: pegasus('/administrators'),
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
  sectionId: state.teacherSections.selectedSectionId,
  scriptData: getCurrentUnitData(state),
  scriptFriendlyName: getSelectedScriptFriendlyName(state)
}))(StandardsView);
