import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import Button from '../../templates/Button';
import SchoolInfoInterstitial from './SchoolInfoInterstitial';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

export const styles = {
  button: {
    marginTop: 20,
    marginLeft: '50%'
  },
  updateButton: {
    marginLeft: 5
  },
  intro: {
    fontSize: 18,
    fontFamily: "'Gotham 5r', sans-serif",
    color: color.charcoal,
    paddingRight: 20
  },
  schoolName: {
    color: color.purple,
    fontStyle: 'italic'
  },
  body: {
    margin: 10
  }
};

class SchoolInfoConfirmationDialog extends Component {
  static propTypes = {
    schoolName: PropTypes.string,
    scriptData: PropTypes.shape({
      formUrl: PropTypes.string.isRequired,
      authTokenName: PropTypes.string.isRequired,
      authTokenValue: PropTypes.string.isRequired,
      existingSchoolInfo: PropTypes.shape({
        id: PropTypes.number,
        user_school_info_id: PropTypes.number,
        school_id: PropTypes.string,
        country: PropTypes.string,
        school_type: PropTypes.string,
        school_name: PropTypes.string,
        full_address: PropTypes.string
      }).isRequired
    }).isRequired,
    onClose: PropTypes.func,
    isOpen: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      showSchoolInterstitial: false,
      schoolName: props.scriptData.existingSchoolInfo.school_name,
      isOpen: props.isOpen || true
    };
  }

  closeModal = () => {
    this.setState({isOpen: false});
    this.props.onClose();
  };

  handleClickYes = () => {
    const {authTokenName, authTokenValue} = this.props.scriptData;
    const formData = new FormData();
    formData.append(authTokenName, authTokenValue);
    fetch(
      `/api/v1/user_school_infos/${
        this.props.scriptData.existingSchoolInfo.user_school_info_id
      }/update_last_confirmation_date`,
      {
        method: 'PATCH',
        body: formData
      }
    )
      .then(this.closeModal)
      .catch(error => {
        this.setState({error});
      });
  };

  handleClickUpdate = () => {
    this.setState({showSchoolInterstitial: true});
  };

  renderInitialContent = () => {
    const {schoolName} = this.state;
    return (
      <Body>
        <div style={styles.body}>
          <p style={styles.intro}>
            {i18n.schoolInfoDialogDescription()}
            <span style={styles.schoolName}>
              {i18n.schoolInfoDialogDescriptionSchoolName({schoolName})}
            </span>
          </p>
        </div>
        <Button
          __useDeprecatedTag
          style={styles.updateButton}
          text={i18n.schoolInfoDialogUpdate()}
          color={Button.ButtonColor.blue}
          onClick={this.handleClickUpdate}
          id="update-button"
        />
        <Button
          __useDeprecatedTag
          style={styles.button}
          text={i18n.yes()}
          color={Button.ButtonColor.orange}
          onClick={this.handleClickYes}
          id="yes-button"
        />
      </Body>
    );
  };

  renderSchoolInformationForm() {
    return (
      <Body>
        <SchoolInfoInterstitial
          scriptData={this.props.scriptData}
          onClose={this.closeModal}
        />
      </Body>
    );
  }

  render() {
    const {showSchoolInterstitial, isOpen} = this.state;
    return (
      <Dialog isOpen={isOpen} handleClose={this.closeModal}>
        {!showSchoolInterstitial
          ? this.renderInitialContent()
          : this.renderSchoolInformationForm()}
      </Dialog>
    );
  }
}

export default SchoolInfoConfirmationDialog;
