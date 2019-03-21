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
    onUpdate: PropTypes.func,
    onConfirm: PropTypes.func,
    isOpen: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showSchoolInterstitial: false,
      schoolName: props.schoolName
    };
  }

  handleUpdateClick = () => {
    this.setState({showSchoolInterstitial: true});
  };

  renderInitialContent() {
    const {onConfirm} = this.props;
    return (
      <div>
        <Body>
          <div>
            <p>
              {i18n.schoolInfoDialogDescription()} Lincoln Elementary School?
            </p>
          </div>
        </Body>
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
      </div>
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
          onClose={() => 'onclose click'}
        />
      </Body>
    );
  }

  render() {
    const {showSchoolInterstitial} = this.state;
    return (
      <Dialog isOpen={this.props.isOpen}>
        {!showSchoolInterstitial
          ? this.renderInitialContent()
          : this.renderSchoolInformationForm()}
      </Dialog>
    );
  }
}
export default SchoolInfoConfirmationDialog;
