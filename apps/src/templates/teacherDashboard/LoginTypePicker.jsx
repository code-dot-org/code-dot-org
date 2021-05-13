/**
 * View shown to a teacher when beginning to add students to an empty section.
 * Lets the teacher decide whether to use word/picture logins, have students
 * manage their own accounts via email/oauth, or to sync students with an
 * external service like Microsoft Classroom or Clever.
 */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {Heading1, Heading2, Heading3} from '../../lib/ui/Headings';
import CardContainer from './CardContainer';
import DialogFooter from './DialogFooter';
import LoginTypeCard from './LoginTypeCard';
import Button from '../Button';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import styleConstants from '../../styleConstants';
// TO DELETE (start) (Optimizely-related)
import color from '../../util/color';
// TO DELETE (end) (Optimizely-related)

/**
 * Following is for Optimizely experiment "Visual and re-wording updates
 * to teachers creating sections".
 * Once the experiment is complete:
 *    1) If newer code is chosen, un-comment the big block of commented code at the
 *        bottom of the file.
 *       Else, replace that block of commented code with original code.
 *    2) Below in the "return" statement, there are 2 divs toggled by userInOptVariant
 *        (top is original, bottom is with changes, delete both <div> wrappers and keep
 *        the contents of whichever one is chosen).
 *    3) Any comment with text "Opt-original" should cause the code below it to be
 *        kept if original code is chosen from the experiment. And any comment with
 *        text "Opt-new" should cause the code below to be kept.
 *       In either case, the code not used should be deleted. And, both of their Optimizely-
 *        related comments should be deleted.
 *    4) Any comment marked "TO DELETE" bookends code that should be deleted regardless of
 *        whether the older or newer code is selected from the experiment. The "TO DELETE"
 *        comments have either (start) or (end) to show how much to delete. (Also, make sure
 *        to delete the "TO DELETE" comments themselves as well.)
 *    5) Delete this comment.
 */

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
    providers: PropTypes.arrayOf(PropTypes.string)
  };

  openImportDialog = provider => {
    this.props.setRosterProvider(provider);
    this.props.handleCancel(); // close this dialog
    this.props.handleImportOpen(); // open the roster dialog
  };

  render() {
    const {
      providers,
      setLoginType,
      handleImportOpen,
      handleCancel,
      disabled
    } = this.props;
    const withGoogle =
      providers && providers.includes(OAuthSectionTypes.google_classroom);
    const withMicrosoft =
      providers && providers.includes(OAuthSectionTypes.microsoft_classroom);
    const withClever =
      providers && providers.includes(OAuthSectionTypes.clever);
    // Opt-original: login option for original version (start) (Optimizely-related)
    const anyImportOptions =
      (withGoogle || withMicrosoft || withClever) &&
      typeof handleImportOpen === 'function';
    // Opt-original: login option for original version (end) (Optimizely-related)
    // Opt-new login option for new version (start) (Optimizely-related)
    const hasThirdParty = withGoogle | withMicrosoft | withClever;
    // Opt-new login option for new version (end) (Optimizely-related)

    // explicitly constrain the container as a whole to the width of the
    // content. We expect that differing length of translations versus english
    // source text can cause unexpected layout changes, and this constraint
    // should help mitigate some of them.
    const containerStyle = {maxWidth: styleConstants['content-width']};

    // Opt-new style const (start) (Optimizely-related)
    // anchor email address policy note to footer just above 'Cancel' button
    const emailPolicyNoteStyle = {
      position: 'absolute',
      top: '0px',
      zIndex: '600'
    };
    // Opt-new style const (end) (Optimizely-related)

    // TO DELETE (start) (Optimizely-related)
    const userInOptVariant =
      sessionStorage.getItem('inTeacherSectionOptimizelyVariant') === 'true'; // Keeps track of whether user is seeing normal site or Optimizely variant
    // TO DELETE (end) (Optimizely-related)

    return (
      <div style={containerStyle}>
        {!userInOptVariant && (
          <div>
            <Heading1>{i18n.newSection()}</Heading1>
            <Heading2>{i18n.addStudentsToSectionInstructions()}</Heading2>
            {anyImportOptions && (
              <Heading3>{i18n.addStudentsManageMyOwn()}</Heading3>
            )}
            <OriginalCardContainer>
              <OriginalPictureLoginCard onClick={setLoginType} />
              <OriginalWordLoginCard onClick={setLoginType} />
              <OriginalEmailLoginCard onClick={setLoginType} />
            </OriginalCardContainer>
            <div>
              <b>{i18n.note()}</b>
              {' ' + i18n.emailAddressPolicy() + ' '}
              <a href="http://blog.code.org/post/147756946588/codeorgs-new-login-approach-to-student-privacy">
                {i18n.moreInfo()}
              </a>
            </div>
            {anyImportOptions && (
              <div>
                <Heading3>{i18n.addStudentsSyncThirdParty()}</Heading3>
                <OriginalCardContainer>
                  {withGoogle && (
                    <OriginalGoogleClassroomCard
                      onClick={this.openImportDialog}
                    />
                  )}
                  {withMicrosoft && (
                    <OriginalMicrosoftClassroomCard
                      onClick={this.openImportDialog}
                    />
                  )}
                  {withClever && (
                    <OriginalCleverCard onClick={this.openImportDialog} />
                  )}
                </OriginalCardContainer>
              </div>
            )}
            <DialogFooter>
              <Button
                __useDeprecatedTag
                onClick={handleCancel}
                text={i18n.dialogCancel()}
                size={Button.ButtonSize.large}
                color={Button.ButtonColor.gray}
                disabled={disabled}
              />
            </DialogFooter>
          </div>
        )}
        {userInOptVariant && (
          <div>
            <Heading1>{i18n.newSectionUpdated()}</Heading1>
            <Heading2>
              {i18n.addStudentsToSectionInstructionsUpdated()}
            </Heading2>
            <div>
              <CardContainer>
                {withGoogle && (
                  <GoogleClassroomCard onClick={this.openImportDialog} />
                )}
                {withMicrosoft && (
                  <MicrosoftClassroomCard onClick={this.openImportDialog} />
                )}
                {withClever && <CleverCard onClick={this.openImportDialog} />}
                <PictureLoginCard onClick={setLoginType} />
                <WordLoginCard onClick={setLoginType} />
                <EmailLoginCard onClick={setLoginType} />
              </CardContainer>
            </div>
            {!hasThirdParty && (
              <div>
                {i18n.thirdPartyProviderUpsell() + ' '}
                <a href="https://support.code.org/hc/en-us/articles/115001319312-Setting-up-sections-with-Google-Classroom-or-Clever">
                  {i18n.learnHow()}
                </a>
                {' ' + i18n.connectAccountThirdPartyProviders()}
              </div>
            )}
            <DialogFooter>
              <div style={emailPolicyNoteStyle}>
                <b>{i18n.note()}</b>
                {' ' + i18n.emailAddressPolicy() + ' '}
                <a href="http://blog.code.org/post/147756946588/codeorgs-new-login-approach-to-student-privacy">
                  {i18n.moreInfo()}
                </a>
              </div>
              <Button
                __useDeprecatedTag
                onClick={handleCancel}
                text={i18n.dialogCancel()}
                size={Button.ButtonSize.large}
                color={Button.ButtonColor.gray}
                disabled={disabled}
              />
            </DialogFooter>
          </div>
        )}
      </div>
    );
  }
}
export const UnconnectedLoginTypePicker = LoginTypePicker;
export default connect(state => ({
  providers: state.teacherSections.providers
}))(LoginTypePicker);

// TO DELETE (start)
// Optimizely login-type click counter function
function optimizelyCountLoginTypeClick(currLoginType) {
  window['optimizely'] = window['optimizely'] || [];
  window['optimizely'].push({type: 'event', eventName: currLoginType});
  return true;
}
// The following are the original versions of the login cards
const OriginalPictureLoginCard = props => (
  <OriginalLoginTypeCard
    className="uitest-pictureLogin"
    title="Picture logins"
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    onClick={() =>
      optimizelyCountLoginTypeClick('pictureLoginType') &&
      props.onClick('picture')
    }
  />
);
OriginalPictureLoginCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

const OriginalWordLoginCard = props => (
  <OriginalLoginTypeCard
    className="uitest-wordLogin"
    title="Word logins"
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    onClick={() =>
      optimizelyCountLoginTypeClick('wordLoginType') && props.onClick('word')
    }
  />
);
OriginalWordLoginCard.propTypes = OriginalPictureLoginCard.propTypes;

const OriginalEmailLoginCard = props => (
  <OriginalLoginTypeCard
    className="uitest-emailLogin"
    title={i18n.loginTypePersonal()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    onClick={() =>
      optimizelyCountLoginTypeClick('emailLoginType') && props.onClick('email')
    }
  />
);
OriginalEmailLoginCard.propTypes = OriginalPictureLoginCard.propTypes;

const OriginalGoogleClassroomCard = props => (
  <OriginalLoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description="Sync your Code.org section with an existing Google Classroom. Students must log in with their Google account."
    onClick={() =>
      optimizelyCountLoginTypeClick('googleClassroomLoginType') &&
      props.onClick(OAuthSectionTypes.google_classroom)
    }
  />
);
OriginalGoogleClassroomCard.propTypes = OriginalPictureLoginCard.propTypes;

const OriginalMicrosoftClassroomCard = props => (
  <OriginalLoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description="Sync your Code.org section with an existing Microsoft Classroom."
    onClick={() =>
      optimizelyCountLoginTypeClick('microsoftClassroomLoginType') &&
      props.onClick(OAuthSectionTypes.microsoft_classroom)
    }
  />
);
OriginalMicrosoftClassroomCard.propTypes = OriginalPictureLoginCard.propTypes;

const OriginalCleverCard = props => (
  <OriginalLoginTypeCard
    title={i18n.loginTypeClever()}
    description="Sync your Code.org section with an existing Clever section. Students must log in with their Clever account."
    onClick={() =>
      optimizelyCountLoginTypeClick('cleverLoginType') &&
      props.onClick(OAuthSectionTypes.clever)
    }
  />
);
OriginalCleverCard.propTypes = OriginalPictureLoginCard.propTypes;

// The following are the newer versions of the login cards
const PictureLoginCard = props => (
  <LoginTypeCard
    className="uitest-pictureLogin"
    title={i18n.loginTypePictureUpdated()}
    subtitle={i18n.loginTypePictureAgeGroup()}
    description={i18n.loginTypePictureDescription()}
    onClick={() =>
      optimizelyCountLoginTypeClick('pictureLoginType') &&
      props.onClick('picture')
    }
  />
);
PictureLoginCard.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

const WordLoginCard = props => (
  <LoginTypeCard
    className="uitest-wordLogin"
    title={i18n.loginTypeWordUpdated()}
    subtitle={i18n.loginTypeWordAgeGroup()}
    description={i18n.loginTypeWordDescription()}
    onClick={() =>
      optimizelyCountLoginTypeClick('wordLoginType') && props.onClick('word')
    }
  />
);
WordLoginCard.propTypes = PictureLoginCard.propTypes;

const EmailLoginCard = props => (
  <LoginTypeCard
    className="uitest-emailLogin"
    title={i18n.loginTypePersonal()}
    subtitle={i18n.loginTypeEmailAgeGroup()}
    description={i18n.loginTypeEmailDescription()}
    onClick={() =>
      optimizelyCountLoginTypeClick('emailLoginType') && props.onClick('email')
    }
  />
);
EmailLoginCard.propTypes = PictureLoginCard.propTypes;

const GoogleClassroomCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeGoogleClassroom()}
    description={i18n.loginTypeGoogleClassroomDescriptionUpdated()}
    onClick={() =>
      optimizelyCountLoginTypeClick('googleClassroomLoginType') &&
      props.onClick(OAuthSectionTypes.google_classroom)
    }
  />
);
GoogleClassroomCard.propTypes = PictureLoginCard.propTypes;

const MicrosoftClassroomCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeMicrosoftClassroom()}
    description={i18n.loginTypeMicrosoftClassroomDescriptionUpdated()}
    onClick={() =>
      optimizelyCountLoginTypeClick('microsoftClassroomLoginType') &&
      props.onClick(OAuthSectionTypes.microsoft_classroom)
    }
  />
);
MicrosoftClassroomCard.propTypes = PictureLoginCard.propTypes;

const CleverCard = props => (
  <LoginTypeCard
    title={i18n.loginTypeClever()}
    description={i18n.loginTypeCleverDescriptionUpdated()}
    onClick={() =>
      optimizelyCountLoginTypeClick('cleverLoginType') &&
      props.onClick(OAuthSectionTypes.clever)
    }
  />
);
CleverCard.propTypes = PictureLoginCard.propTypes;

const originalLoginTypeCardStyles = {
  card: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    // Set width to form a three-column layout on 970px teacher dashboard.
    width: 312,
    // Uniform height, even in different rows
    flex: '0 0 auto',
    minHeight: 150,
    padding: 16,
    marginBottom: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    borderRadius: 5,
    background: color.white
  },
  title: {
    paddingBottom: 6,
    fontSize: 24,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    zIndex: 2,
    color: color.charcoal
  },
  subtitle: {
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: '18px',
    fontFamily: '"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.charcoal
  },
  description: {
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 13,
    lineHeight: '18px',
    fontFamily: '"Gotham 4r", sans-serif',
    zIndex: 2,
    color: color.charcoal
  }
};
class OriginalLoginTypeCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string
  };

  state = {
    hover: false
  };

  toggleHover = () => {
    this.setState({hover: !this.state.hover});
  };

  render() {
    const {title, subtitle, description, onClick} = this.props;

    if (this.state.hover) {
      originalLoginTypeCardStyles.card.borderColor = color.dark_charcoal;
      originalLoginTypeCardStyles.title.color = color.dark_charcoal;
      originalLoginTypeCardStyles.subtitle.color = color.dark_charcoal;
      originalLoginTypeCardStyles.description.color = color.dark_charcoal;
    } else {
      originalLoginTypeCardStyles.card.borderColor = color.border_gray;
      originalLoginTypeCardStyles.title.color = color.charcoal;
      originalLoginTypeCardStyles.subtitle.color = color.charcoal;
      originalLoginTypeCardStyles.description.color = color.charcoal;
    }

    return (
      <div
        style={originalLoginTypeCardStyles.card}
        onClick={onClick}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
        className={this.props.className}
      >
        <div>
          <div style={originalLoginTypeCardStyles.title}>{title}</div>
          {subtitle && (
            <div style={originalLoginTypeCardStyles.subtitle}>{subtitle}</div>
          )}
          <div style={originalLoginTypeCardStyles.description}>
            {description}
          </div>
        </div>
      </div>
    );
  }
}

const originalCardContainerStyle = {
  width: styleConstants['content-width'],
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between'
};
class OriginalCardContainer extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  render() {
    return <div style={originalCardContainerStyle}>{this.props.children}</div>;
  }
}
// TO DELETE (end)

// const PictureLoginCard = props => (
//   <LoginTypeCard
//     className="uitest-pictureLogin"
//     title={i18n.loginTypePicture()}
//     subtitle={i18n.loginTypePictureAgeGroup()}
//     description={i18n.loginTypePictureDescription()}
//     onClick={() => props.onClick('picture')}
//   />
// );
// PictureLoginCard.propTypes = {
//   onClick: PropTypes.func.isRequired,
//   disabled: PropTypes.bool
// };

// const WordLoginCard = props => (
//   <LoginTypeCard
//     className="uitest-wordLogin"
//     title={i18n.loginTypeWord()}
//     subtitle={i18n.loginTypeWordAgeGroup()}
//     description={i18n.loginTypeWordDescription()}
//     onClick={() => props.onClick('word')}
//   />
// );
// WordLoginCard.propTypes = PictureLoginCard.propTypes;

// const EmailLoginCard = props => (
//   <LoginTypeCard
//     className="uitest-emailLogin"
//     title={i18n.loginTypePersonal()}
//     subtitle={i18n.loginTypeEmailAgeGroup()}
//     description={i18n.loginTypeEmailDescription()}
//     onClick={() => props.onClick('email')}
//   />
// );
// EmailLoginCard.propTypes = PictureLoginCard.propTypes;
//
// const GoogleClassroomCard = props => (
//   <LoginTypeCard
//     title={i18n.loginTypeGoogleClassroom()}
//     description={i18n.loginTypeGoogleClassroomDescription()}
//     onClick={() => props.onClick(OAuthSectionTypes.google_classroom)}
//   />
// );
// GoogleClassroomCard.propTypes = PictureLoginCard.propTypes;

// const MicrosoftClassroomCard = props => (
//   <LoginTypeCard
//     title={i18n.loginTypeMicrosoftClassroom()}
//     description={i18n.loginTypeMicrosoftClassroomDescription()}
//     onClick={() => props.onClick(OAuthSectionTypes.microsoft_classroom)}
//   />
// );
// MicrosoftClassroomCard.propTypes = PictureLoginCard.propTypes;

// const CleverCard = props => (
//   <LoginTypeCard
//     title={i18n.loginTypeClever()}
//     description={i18n.loginTypeCleverDescription()}
//     onClick={() => props.onClick(OAuthSectionTypes.clever)}
//   />
// );
// CleverCard.propTypes = PictureLoginCard.propTypes;
