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
            <hr style={styles.pageBreak} />
            <p style={styles.descriptionText}>{i18n.sectionSetupFirstStep()}</p>
            <hr style={styles.pageBreak} />
            <div style={styles.footerButtons}>
              <Button
                id="uitest-abandon-section-creation"
                text={i18n.goToMyDashboard()}
                color={Button.ButtonColor.gray}
                onClick={this.abandonEditingSection}
              />
              <Button
                id="uitest-accept-section-creation"
                text={i18n.createClassSections()}
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
  pageBreak: {
    borderTop: '3px solid grey'
  },
  dialogCentering: {
    marginLeft: '20px',
    marginRight: '20px'
  },
  title: {
    color: color.teal,
    fontSize: '24px'
  },
  descriptionText: {
    fontSize: '14px'
  },
  footerButtons: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  }
};

export default connect(
  undefined,
  {
    beginEditingSection
  }
)(InitialSectionCreationInterstitial);
