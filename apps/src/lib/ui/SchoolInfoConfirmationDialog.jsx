import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import Button from '../../templates/Button';
import SchoolInfoInterstitial from './SchoolInfoInterstitial';
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

  handleUpdateClick = () => {
    this.setState({showSchoolInterstitial: true});
  };

  renderInitialContent() {
    const {schoolName} = this.state;
    return (
      <Body>
        <div>
          <p>
            {i18n.schoolInfoDialogDescription()} {schoolName}
          </p>
        </div>
        <Button
          text={i18n.schoolInfoDialogUpdate()}
          color={Button.ButtonColor.blue}
          onClick={this.handleUpdateClick}
        />
        <Button
          style={styles.button}
          text={i18n.yes()}
          color={Button.ButtonColor.orange}
          onClick={this.handleClick}
          href={'#'}
        />
      </Body>
    );
  }

  renderSchoolInformationForm() {
    return (
      <Body>
        <SchoolInfoInterstitial
          scriptData={{
            formUrl: '',
            authTokenName: 'auth_token',
            authTokenValue: 'fake_auth_token',
            existingSchoolInfo: {}
          }}
          onClose={() => this.setState({isOpen: false})}
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
