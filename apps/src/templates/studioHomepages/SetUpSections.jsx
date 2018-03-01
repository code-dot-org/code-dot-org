import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {beginEditingNewSection} from '../teacherDashboard/teacherSectionsRedux';
import SetUpMessage from './SetUpMessage';

class SetUpSections extends Component {
  static propTypes = {
    beginEditingNewSection: PropTypes.func.isRequired,
  };

  // Wrapped to avoid passing event args
  beginEditingNewSection = () => this.props.beginEditingNewSection();

  render() {
    return (
      <SetUpMessage
        type="sections"
        headingText={i18n.setUpClassroom()}
        descriptionText={i18n.createNewClassroom()}
        buttonText={i18n.createSection()}
        className="uitest-set-up-sections"
        buttonClass="uitest-newsection"
        onClick={this.beginEditingNewSection}
      />
    );
  }
}
export const UnconnectedSetUpSections = SetUpSections;
export default connect(undefined, {
  beginEditingNewSection,
})(SetUpSections);
