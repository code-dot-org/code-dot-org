import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {beginEditingNewSection} from '../teacherDashboard/teacherSectionsRedux';
import SetUpMessage from './SetUpMessage';

class SetUpSections extends Component {
  static propTypes = {
    isRtl: PropTypes.bool,
    beginEditingNewSection: PropTypes.func.isRequired,
  };

  render() {
    const {isRtl, beginEditingNewSection} = this.props;
    return (
      <SetUpMessage
        type="sections"
        headingText={i18n.setUpClassroom()}
        descriptionText={i18n.createNewClassroom()}
        buttonText={i18n.createSection()}
        className="uitest-set-up-sections"
        buttonClass="uitest-newsection"
        isRtl={isRtl}
        onClick={beginEditingNewSection}
      />
    );
  }
}
export const UnconnectedSetUpSections = SetUpSections;
export default connect(undefined, {
  beginEditingNewSection: () => beginEditingNewSection(),
})(SetUpSections);
