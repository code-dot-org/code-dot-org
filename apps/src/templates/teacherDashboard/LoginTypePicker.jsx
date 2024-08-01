/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {
  OAuthSectionTypes,
  LmsLoginTypeNames,
  LmsLoginInstructionUrls,
} from '@cdo/apps/lib/ui/accounts/constants';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {Heading3} from '../../legacySharedComponents/Headings';
import styleConstants from '../../styleConstants';

import CardContainer from './CardContainer';
import LmsInformationalCard from './LmsInformationalCard';
import {
  canvasLogo,
  cleverLogo,
  googleClassroomLogo,
  schoologyLogo,
} from './LmsInformationalCard/assets';
import LoginTypeCard from './LoginTypeCard';

const LOGIN_TYPE_SELECTED_EVENT = 'Login Type Selected';
const CANCELLED_EVENT = 'Section Setup Cancelled';
const SELECT_LOGIN_TYPE = 'Login Type Selection';

/**
 * UI for selecting the login type of a class section:
 * Word, picture, or email logins, or one of several third-party integrations.
 */
class LoginTypePicker extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    handleImportOpen: PropTypes.func,
    setRosterProvider: PropTypes.func,
    setLoginType: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
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

  recordSectionSetupExitEvent = eventName => {
    analyticsReporter.sendEvent(
      eventName,
      {
        source: SELECT_LOGIN_TYPE,
      },
      PLATFORMS.BOTH
    );
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

  cancel = () => {
    this.recordSectionSetupExitEvent(CANCELLED_EVENT);
    this.props.handleCancel();
  };

  render() {
    const {title, providers, disabled} = this.props;
    const withGoogle =
      providers && providers.includes(OAuthSectionTypes.google_classroom);
    const withMicrosoft =
      providers && providers.includes(OAuthSectionTypes.microsoft_classroom);
    const withClever =
      providers && providers.includes(OAuthSectionTypes.clever);
    const withLti = providers && providers.includes(SectionLoginType.lti_v1);
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
      (inUSA && currentUser.isTeacher) ||
      experiments.isEnabledAllowingQueryString(experiments.CPA_EXPERIENCE);

    const style = {
      container: {
        width: styleConstants['content-width'],
        left: '20px',
        right: '20px',
      },
      scroll: {
        overflowX: 'hidden',
        overflowY: 'auto',
      },
      thirdPartyProviderUpsell: {
        marginBottom: '10px',
      },
      warningIcon: {
        color: 'red',
        marginLeft: '5px',
        marginRight: '5px',
      },
      warningHeader: {
        color: 'red',
      },
      footer: {
        width: styleConstants['content-width'],
        height: '100px',
        left: 0,
        bottom: '-51px',
        backgroundColor: '#fff',
        borderRadius: '5px',
      },
      mediumText: {
        fontSize: '.75em',
        color: color.neutral_dark,
        ...fontConstants['main-font-semi-bold'],
      },
      emailPolicyNote: {
        marginBottom: '31px',
        paddingTop: '8px',
        borderTop: `1px solid ${color.neutral_dark}`,
      },
      subheader: {
        fontSize: '16px',
        fontWeight: 600,
        color: color.charcoal,
        marginTop: '16px',
      },
      lmsInfoCardsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        rowGap: '16px',
        columnGap: '16px',
        paddingBottom: '16px',
      },
    };

    return (
      <div style={style.container}>
        <Heading3 isRebranded>{title}</Heading3>
        <p>{i18n.addStudentsToSectionInstructionsUpdated()}</p>
        {showStudentsToSectionPermissionWarning && (
          <p>
            <span
              className="fa fa-exclamation-triangle"
              aria-hidden="true"
              style={style.warningIcon}
            />
            <span style={style.warningHeader}>
              <strong>
                {i18n.addStudentsToSectionPermissionHeader() + ' '}
              </strong>
            </span>
            {i18n.addStudentsToSectionPermissionWarning() + ' '}
            <Button
              styleAsText={true}
              onClick={() => this.setState({isLearnMoreOpen: true})}
            >
              {i18n.learnMore()}
            </Button>
          </p>
        )}
        {this.state.isLearnMoreOpen && (
          <StylizedBaseDialog
            isOpen={true}
            hideFooter={true}
            renderFooter={() => {}}
            confirmationButtonText="OK"
            cancellationButtonText="Cancel"
            body={<p>{i18n.addStudentsToSectionPermissionExplanation()}</p>}
            handleClose={() => this.setState({isLearnMoreOpen: false})}
          />
        )}
        <h6 style={style.subheader}>{i18n.loginTypes()}</h6>
        <div style={style.scroll}>
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
        </div>
        {experiments.isEnabled(experiments.SECTION_CREATE_LMS_CARDS) &&
          !withAllLmsProviders && (
            <>
              <h6 style={style.subheader}>{i18n.lmsIntegrations()}</h6>
              <div
                style={style.lmsInfoCardsContainer}
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
                    lmsInformationalUrl={
                      LmsLoginInstructionUrls.google_classroom
                    }
                  />
                )}
                {!withLti && (
                  <>
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
                  </>
                )}
              </div>
            </>
          )}
        <div style={style.footer}>
          <p style={{...style.mediumText, ...style.emailPolicyNote}}>
            {i18n.note()}
            {' ' + i18n.emailAddressPolicy() + ' '}
            <a href="https://code.org/privacy">{i18n.moreInfo()}</a>
          </p>
          <Button
            onClick={this.cancel}
            text={i18n.dialogCancel()}
            color={Button.ButtonColor.neutralDark}
            disabled={disabled}
          />
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
