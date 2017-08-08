import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {beginEditingNewSection} from '../teacherDashboard/teacherSectionsRedux';
import SetUpMessage from './SetUpMessage';

class SetUpSections extends Component {
  static propTypes = {
    isRtl: PropTypes.bool,
    beginEditingNewSection: PropTypes.func.isRequired,
  };

  render() {
    const {isRtl, beginEditingNewSection} = this.props;
    const sectionFlow2017 = experiments.isEnabled(SECTION_FLOW_2017);
    const clickHandlerProp = sectionFlow2017 ?
      {onClick: beginEditingNewSection} :
      {buttonUrl: pegasus('/teacher-dashboard#/sections')};
    return (
      <SetUpMessage
        type="sections"
        headingText={i18n.setUpClassroom()}
        descriptionText={i18n.createNewClassroom()}
        buttonText={i18n.createSection()}
        className="uitest-set-up-sections"
        buttonClass="uitest-newsection"
        isRtl={isRtl}
        {...clickHandlerProp}
      />
    );
  }
}
export const UnconnectedSetUpSections = SetUpSections;
export default connect(undefined, {
  beginEditingNewSection: () => beginEditingNewSection(),
})(SetUpSections);
