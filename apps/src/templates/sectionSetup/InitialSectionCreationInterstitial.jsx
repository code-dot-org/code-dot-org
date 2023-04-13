import React, {Component} from 'react';
import PropTypes from 'prop-types';
import PadAndCenter from '@cdo/apps/templates/teacherDashboard/PadAndCenter';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {connect} from 'react-redux';
import {beginEditingSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

class InitialSectionCreationInterstitial extends Component {
  static propTypes = {
    // Connected to Redux
    beginEditingSection: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    };
  }

  beginEditingSection = () => {
    this.setState({isOpen: false});
    analyticsReporter.sendEvent(EVENTS.SECTION_SETUP_SIGN_IN_EVENT);
    this.props.beginEditingSection();
  };

  abandonEditingSection = () => {
    this.setState({isOpen: false});
    analyticsReporter.sendEvent(EVENTS.ABANDON_SECTION_SETUP_SIGN_IN_EVENT);
  };

  render() {
    const {isOpen} = this.state;

    return (
      <BaseDialog
        useUpdatedStyles
        handleClose={this.abandonEditingSection}
        isOpen={isOpen}
      >
        <PadAndCenter>
          <div style={styles.dialogCentering}>
            <h1 style={styles.title}>
              {i18n.sectionSetupOnInitialAccountCreation()}
            </h1>
            <p style={styles.descriptionText}>{i18n.sectionSetupFirstStep()}</p>
            <div style={styles.footerButtons}>
              <Button
                id="uitest-abandon-section-creation"
                text={i18n.goToMyDashboard()}
                style={styles.leftButton}
                color={Button.ButtonColor.neutralDark}
                onClick={this.abandonEditingSection}
              />
              <Button
                id="uitest-accept-section-creation"
                text={i18n.createClassSections()}
                style={styles.rightButton}
                color={Button.ButtonColor.brandSecondaryDefault}
                onClick={this.beginEditingSection}
              />
            </div>
          </div>
        </PadAndCenter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialogCentering: {
    marginLeft: '20px',
    marginRight: '20px'
  },
  title: {
    color: color.neutral_dark,
    fontSize: '1.25em',
    marginBottom: '0.5em',
    fontFamily: "'Gotham 5r', sans-serif"
  },
  descriptionText: {
    fontSize: '1em',
    marginBottom: '1em',
    color: color.neutral_dark
  },
  footerButtons: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  leftButton: {
    marginLeft: 0
  },
  rightButton: {
    marginRight: 0
  }
};

export default connect(undefined, {
  beginEditingSection
})(InitialSectionCreationInterstitial);
