import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {beginEditingNewSection} from '../teacherDashboard/teacherSectionsRedux';
import BorderedCallToAction from './BorderedCallToAction';

class SetUpSections extends Component {
  static propTypes = {
    beginEditingNewSection: PropTypes.func.isRequired,
    hasSections: PropTypes.bool
  };

  // Wrapped to avoid passing event args
  beginEditingNewSection = () => this.props.beginEditingNewSection();

  render() {
    const headingText = this.props.hasSections
      ? i18n.newSectionAdd()
      : i18n.setUpClassroom();

    return (
      <BorderedCallToAction
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
export default connect(
  undefined,
  {
    beginEditingNewSection
  }
)(SetUpSections);
