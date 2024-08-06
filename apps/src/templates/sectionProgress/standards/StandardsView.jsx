import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/unitSelectionRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getCurrentUnitData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {pegasus} from '@cdo/apps/util/urlHelpers';
import i18n from '@cdo/locale';

import {unitDataPropType} from '../sectionProgressConstants';

import {cstaStandardsURL} from './standardsConstants';
import StandardsIntroDialog from './StandardsIntroDialog';
import StandardsLegend from './StandardsLegend';
import StandardsProgressTable from './StandardsProgressTable';

class StandardsView extends Component {
  static propTypes = {
    showStandardsIntroDialog: PropTypes.bool,
    //redux
    sectionId: PropTypes.number.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: unitDataPropType,
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
              cstaLink: cstaStandardsURL,
            })}
          />
          <h3>{i18n.standardsGetInvolved()}</h3>
          <SafeMarkdown
            markdown={i18n.standardsGetInvolvedDetails({
              adminLink: pegasus('/administrators'),
              parentLink: pegasus('/help'),
              teacherLink: pegasus('/teach'),
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
  scriptFriendlyName: getSelectedScriptFriendlyName(state),
}))(StandardsView);
