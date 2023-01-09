import React, {Component} from 'react';
import PropTypes from 'prop-types';
import PadAndCenter from '@cdo/apps/templates/teacherDashboard/PadAndCenter';
import i18n from '@cdo/locale';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {connect} from 'react-redux';
import {beginEditingSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

class InitialSectionCreationInterstitial extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    // Connected to Redux
    beginEditingSection: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen || true
    };
  }

  beginEditingSection = () => {
    this.closeModal();
    this.props.beginEditingSection();
  };

  closeModal = () => {
    this.setState({isOpen: false});
    this.props.onClose();
  };

  render() {
    const {isOpen} = this.state;

    return (
      <BaseDialog
        useUpdatedStyles
        handleClose={this.closeModal}
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
                text={i18n.goToMyDashboard()}
                color={Button.ButtonColor.gray}
                onClick={this.closeModal}
              />
              <Button
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
