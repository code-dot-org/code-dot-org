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
    onUpdate: PropTypes.func,
    onConfirm: PropTypes.func,
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

  static defaultProps = {
    onUpdate: () => {},
    schoolName: ''
  };

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
    const {onConfirm} = this.props;
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
          onClick={onConfirm}
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
