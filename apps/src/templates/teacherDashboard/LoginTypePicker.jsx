import Alert from '@code-dot-org/component-library/alert';
import Dialog from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import {Button as MuiButton, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
  OAuthSectionTypes,
  LmsLoginTypeNames,
  LmsLoginInstructionUrls,
} from '@cdo/apps/accounts/constants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import CardContainer from './CardContainer';
import LmsInformationalCard from './LmsInformationalCard';
import {
  canvasLogo,
  cleverLogo,
  googleClassroomLogo,
  schoologyLogo,
} from './LmsInformationalCard/assets';
import LoginTypeCard from './LoginTypeCard';

import styles from './sectionSetup.module.scss';
const LOGIN_TYPE_SELECTED_EVENT = 'Login Type Selected';
const CANCELLED_EVENT = 'Section Setup Cancelled';
const SELECT_LOGIN_TYPE = 'Login Type Selection';

export const recordLoginTypePickerCancelled = () => {
  analyticsReporter.sendEvent(CANCELLED_EVENT, {
    source: SELECT_LOGIN_TYPE,
  });
};

/**
 * UI for selecting the login type of a class section:
 * Word, picture, or email logins, or one of several third-party integrations.
 */
class LoginTypePicker extends Component {
  static propTypes = {
    handleImportOpen: PropTypes.func,
    handleCancel: PropTypes.func.isRequired,
    setRosterProvider: PropTypes.func,
    setLoginType: PropTypes.func.isRequired,
    // Provided by Redux
    providers: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);
    this.state = {
      isLearnMoreOpen: false,
    };
  }

  reportLoginTypeSelection = provider => {
    analyticsReporter.sendEvent(LOGIN_TYPE_SELECTED_EVENT, {
      loginType: provider,
    });
  };

  openImportDialog = provider => {
    this.reportLoginTypeSelection(provider);
    this.props.setRosterProvider(provider);
    this.props.handleCancel(); // close this dialog
    this.props.handleImportOpen(); // open the roster dialog
  };

  onLoginTypeSelect = provider => {
    this.reportLoginTypeSelection(provider);
    this.props.setLoginType(provider);
  };

  render() {
    const {providers} = this.props;
    const withGoogle =
      providers && providers.includes(OAuthSectionTypes.google_classroom);
    const withMicrosoft =
      providers && providers.includes(OAuthSectionTypes.microsoft_classroom);
    const withClever =
      providers && providers.includes(OAuthSectionTypes.clever);
    const withAllLmsProviders =
      providers &&
      [
        OAuthSectionTypes.google_classroom,
        OAuthSectionTypes.clever,
        SectionLoginType.lti_v1,
      ].every(provider => providers.includes(provider));
    const currentUser = getStore().getState().currentUser;
    const inUSA =
      ['US', 'RD'].includes(currentUser.countryCode) ||
      !!currentUser.usStateCode;
    const showStudentsToSectionPermissionWarning =
      inUSA && currentUser.isTeacher;

    return (
      <div className={styles.screen}>
        <Typography
          id="dsco-dialog-description"
          className={styles.bodyText}
          variant="body2"
        >
          {i18n.addStudentsToSectionInstructionsUpdated()}
        </Typography>
        {showStudentsToSectionPermissionWarning && (
          <Alert
            className={styles.warningAlert}
            type="warning"
            size="s"
            isImmediateImportance={false}
            text={
              <>
                <strong>{i18n.addStudentsToSectionPermissionHeader()}</strong>{' '}
                {i18n.addStudentsToSectionPermissionWarning()}{' '}
                <MuiButton
                  className={styles.learnMoreButton}
                  variant="text"
                  color="primary"
                  size="small"
                  type="button"
                  onClick={() => this.setState({isLearnMoreOpen: true})}
                >
                  {i18n.learnMore()}
                </MuiButton>
              </>
            }
          />
        )}
        {this.state.isLearnMoreOpen && (
          <Dialog
            title={i18n.addStudentsToSectionPermissionHeader()}
            description={i18n.addStudentsToSectionPermissionExplanation()}
            primaryButtonProps={{
              text: i18n.ok(),
              onClick: () => this.setState({isLearnMoreOpen: false}),
            }}
            onClose={() => this.setState({isLearnMoreOpen: false})}
          />
        )}
        <Typography className={styles.sectionTitle} variant="h6">
          {i18n.loginTypes()}
        </Typography>
        <CardContainer>
          {withGoogle && (
            <GoogleClassroomCard onClick={this.openImportDialog} />
          )}
          {withMicrosoft && (
            <MicrosoftClassroomCard onClick={this.openImportDialog} />
          )}
          {withClever && <CleverCard onClick={this.openImportDialog} />}
          <PictureLoginCard onClick={this.onLoginTypeSelect} />
          <WordLoginCard onClick={this.onLoginTypeSelect} />
          <EmailLoginCard onClick={this.onLoginTypeSelect} />
        </CardContainer>
        {!withAllLmsProviders && (
          <>
            <Typography className={styles.sectionTitle} variant="h6">
              {i18n.lmsIntegrations()}
            </Typography>
            <div
              className={styles.lmsCards}
              // eslint-disable-next-line react/forbid-dom-props
              data-testid={'lms-info-cards-container'}
            >
              {!withClever && (
                <LmsInformationalCard
                  lmsName={LmsLoginTypeNames.clever}
                  lmsLogo={cleverLogo}
                  lmsInformationalUrl={LmsLoginInstructionUrls.clever}
                />
              )}
              {!withGoogle && (
                <LmsInformationalCard
                  lmsName={LmsLoginTypeNames.google_classroom}
                  lmsLogo={googleClassroomLogo}
                  lmsInformationalUrl={LmsLoginInstructionUrls.google_classroom}
                />
              )}
              <LmsInformationalCard
                lmsName={LmsLoginTypeNames.canvas}
                lmsLogo={canvasLogo}
                lmsInformationalUrl={LmsLoginInstructionUrls.canvas}
              />
              <LmsInformationalCard
                lmsName={LmsLoginTypeNames.schoology}
                lmsLogo={schoologyLogo}
                lmsInformationalUrl={LmsLoginInstructionUrls.schoology}
              />
            </div>
          </>
        )}
        <div className={styles.footer}>
          <Typography className={styles.note} variant="body2">
            {i18n.note()}
            {' ' + i18n.emailAddressPolicy() + ' '}
            <Link href="https://code.org/privacy">{i18n.moreInfo()}</Link>
          </Typography>
        </div>
      </div>
    );
  }
}

export const UnconnectedLoginTypePicker = LoginTypePicker;

export default connect(state => ({
  providers: state.teacherSections.providers,
}))(LoginTypePicker);

const PictureLoginCard = props => (
  <LoginTypeCard
    className="uitest-pictureLogin"
    title={i18n.loginTypePictureUpdated()}
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    onClick={() => props.onClick('picture')}
  />
);

PictureLoginCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const WordLoginCard = props => (
  <LoginTypeCard
    className="uitest-wordLogin"
    title={i18n.loginTypeWordUpdated()}
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    onClick={() => props.onClick('word')}
  />
);

WordLoginCard.propTypes = PictureLoginCard.propTypes;

const EmailLoginCard = props => (
  <LoginTypeCard
    className="uitest-emailLogin"
    title={i18n.loginTypePersonal()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    onClick={() => props.onClick('email')}
  />
);

EmailLoginCard.propTypes = PictureLoginCard.propTypes;

const GoogleClassroomCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description={i18n.loginTypeGoogleClassroomDescriptionUpdated()}
    onClick={() => props.onClick(OAuthSectionTypes.google_classroom)}
  />
);

GoogleClassroomCard.propTypes = PictureLoginCard.propTypes;

const MicrosoftClassroomCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description={i18n.loginTypeMicrosoftClassroomDescriptionUpdated()}
    onClick={() => props.onClick(OAuthSectionTypes.microsoft_classroom)}
  />
);

MicrosoftClassroomCard.propTypes = PictureLoginCard.propTypes;

const CleverCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeClever()}
    description={i18n.loginTypeCleverDescriptionUpdated()}
    onClick={() => props.onClick(OAuthSectionTypes.clever)}
  />
);

CleverCard.propTypes = PictureLoginCard.propTypes;
