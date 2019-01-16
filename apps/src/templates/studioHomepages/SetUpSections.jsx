import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {beginEditingNewSection} from '../teacherDashboard/teacherSectionsRedux';
import SetUpMessage from './SetUpMessage';

class SetUpSections extends Component {
  static propTypes = {
    beginEditingNewSection: PropTypes.func.isRequired,
    hasSections: PropTypes.bool,
  };

  // Wrapped to avoid passing event args
  beginEditingNewSection = () => this.props.beginEditingNewSection();

  render() {
    const headingText = this.props.hasSections ?
      i18n.newSectionAdd() : i18n.setUpClassroom();

    return (
      <SetUpMessage
        type="sections"
        headingText={headingText}
        descriptionText={i18n.createNewClassroom()}
        buttonText={i18n.createSection()}
        className="uitest-set-up-sections"
        buttonClass="uitest-newsection"
        onClick={this.beginEditingNewSection}
        solidBorder={this.props.hasSections}
      />
    );
  }
}
export const UnconnectedSetUpSections = SetUpSections;
export default connect(undefined, {
  beginEditingNewSection,
})(SetUpSections);
