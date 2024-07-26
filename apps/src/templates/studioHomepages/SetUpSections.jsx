import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import i18n from '@cdo/locale';

import {beginEditingSection} from '../teacherDashboard/teacherSectionsRedux';

import BorderedCallToAction from './BorderedCallToAction';

// Amplitude analytics events.
const STARTED_EVENT = 'Section Setup Started';

class SetUpSections extends Component {
  static propTypes = {
    beginEditingSection: PropTypes.func.isRequired,
    headingText: PropTypes.string,
    descriptionText: PropTypes.string,
    solidBorder: PropTypes.bool,
  };

  // Wrapped to avoid passing event args
  beginEditingSection = () => {
    this.recordSectionSetupStartedEvent();
    this.props.beginEditingSection();
  };

  recordSectionSetupStartedEvent = () => {
    analyticsReporter.sendEvent(STARTED_EVENT, {}, PLATFORMS.BOTH);
  };

  render() {
    return (
      <BorderedCallToAction
        type="sections"
        headingText={this.props.headingText || i18n.newSectionAdd()}
        descriptionText={
          this.props.descriptionText || i18n.createNewClassroom()
        }
        buttonText={i18n.createSection()}
        className="uitest-set-up-sections"
        buttonClass="uitest-newsection"
        onClick={this.beginEditingSection}
        solidBorder={this.props.solidBorder || false}
      />
    );
  }
}
export const UnconnectedSetUpSections = SetUpSections;
export default connect(undefined, {
  beginEditingSection,
})(SetUpSections);
