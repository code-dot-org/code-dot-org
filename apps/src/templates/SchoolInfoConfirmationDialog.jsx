import React, {Component, PropTypes} from 'react';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import Button from './Button';
import SchoolInfoInterstitial from '../lib/ui/SchoolInfoInterstitial';
import i18n from '@cdo/locale';

export const styles = {
  button: {
    marginTop: 30,
    marginLeft: 290
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
        school_id: PropTypes.string,
        country: PropTypes.string,
        school_type: PropTypes.string,
        school_name: PropTypes.string,
        full_address: PropTypes.string
      }).isRequired
    }).isRequired,
    onClose: PropTypes.func,
    isOpen: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      showSchoolInterstitial: false,
      schoolName: props.schoolName,
      isOpen: true
    };
  }

  componentDidMount() {
    const {schoolName} = this.state;
    if (!schoolName && schoolName.length > 0) {
      fetch('/dashboardapi/v1/users/me/school_name')
        .then(response => response.json())
        .then(data => {
          this.setState({
            schoolName: data.school_name
          });
        })
        .catch(error => this.setState({error}));
    }
  }

  handleClickYes = () => {
    fetch(
      `/api/v1/update_last_confirmation_date/${
        this.props.scriptData.existingSchoolInfo.id
      }`,
      {method: 'PATCH'}
    )
      .then(() => this.props.onClose())
      .catch(error => this.setState({error}));
  };

  handleClickUpdate = () => {
    fetch(
      `/api/v1/user_school_infos/${
        this.props.scriptData.existingSchoolInfo.id
      }/update_end_date_last_seen_school_info_interstitial`,
      {method: 'PATCH'}
    )
      .then(() => this.setState({showSchoolInterstitial: true}))
      .catch(() => {});
  };

  handleClickSave = () => {};

  renderInitialContent() {
    const {schoolName} = this.state;
    return (
      <Body>
        <div>
          <p>{i18n.schoolInfoDialogDescription({schoolName})}</p>
        </div>
        <Button
          text={i18n.schoolInfoDialogUpdate()}
          color={Button.ButtonColor.blue}
          onClick={this.handleClickUpdate}
        />
        <Button
          style={styles.button}
          text={i18n.yes()}
          color={Button.ButtonColor.orange}
          onClick={this.handleClickYes}
        />
      </Body>
    );
  }

  renderSchoolInformationForm() {
    return (
      <Body>
        <SchoolInfoInterstitial
          scriptData={this.props.scriptData}
          onClose={() => {
            this.handleClickSave();
            this.setState({isOpen: false});
          }}
        />
      </Body>
    );
  }

  render() {
    const {showSchoolInterstitial, isOpen} = this.state;
    return (
      <Dialog isOpen={isOpen}>
        {!showSchoolInterstitial
          ? this.renderInitialContent()
          : this.renderSchoolInformationForm()}
      </Dialog>
    );
  }
}

export default SchoolInfoConfirmationDialog;
