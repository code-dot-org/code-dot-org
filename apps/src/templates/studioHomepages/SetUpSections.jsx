import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {beginEditingSection} from '../teacherDashboard/teacherSectionsRedux';
import BorderedCallToAction from './BorderedCallToAction';

class SetUpSections extends Component {
  static propTypes = {
    beginEditingSection: PropTypes.func.isRequired,
    hasSections: PropTypes.bool,
    isPlSections: PropTypes.bool
  };

  // Wrapped to avoid passing event args
  beginEditingSection = () => this.props.beginEditingSection();

  render() {
    const headingText = this.props.isPlSections
      ? this.props.hasSections
        ? i18n.newSectionPlAdd()
        : i18n.setUpProfessionalLearning()
      : this.props.hasSections
      ? i18n.newSectionAdd()
      : i18n.setUpClassroom();

    return (
      <BorderedCallToAction
        type="sections"
        headingText={headingText}
        descriptionText={
          this.props.isPlSections
            ? i18n.createNewPlSection()
            : i18n.createNewClassroom()
        }
        buttonText={i18n.createSection()}
        className="uitest-set-up-sections"
        buttonClass="uitest-newsection"
        onClick={this.beginEditingSection}
        solidBorder={this.props.hasSections}
      />
    );
  }
}
export const UnconnectedSetUpSections = SetUpSections;
export default connect(
  undefined,
  {
    beginEditingSection
  }
)(SetUpSections);
