import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState, useCallback, useRef} from 'react';
import {Provider} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {showVideoDialog} from '@cdo/apps/code-studio/videos';
import {
  BodyTwoText,
  Heading1,
  Heading3,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import InfoHelpTip from '@cdo/apps/sharedComponents/InfoHelpTip';
import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
import CoteacherSettings from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/CoteacherSettings';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import AdvancedSettingToggles from './AdvancedSettingToggles';
import {getCoteacherMetricInfoFromSection} from './coteacherSettings/CoteacherUtils';
import CurriculumQuickAssign from './CurriculumQuickAssign';
import SingleSectionSetUp from './SingleSectionSetUp';

import moduleStyles from './sections-refresh.module.scss';

const FORM_ID = 'sections-set-up-container';
const SECTIONS_API = '/api/v1/sections';
const NEW = 'New';

// Custom hook to update the list of sections to create
// Currently, this hook returns two things:
//   - sections: list of objects that represent the sections to create
//   - updateSection: function to update the section at the given index
const useSections = section => {
  // added "default properties" for any new section
  const [sections, setSections] = useState(
    section
      ? [
          {
            ...Object.keys(section).reduce((acc, cur) => {
              if (cur !== 'stageExtras') {
                acc[cur] = section[cur];
              }
              return acc;
            }, {}),
            lessonExtras: section.stageExtras,
          },
        ]
      : [
          {
            pairingAllowed: true,
            restrictSection: false,
            ttsAutoplayEnabled: false,
            lessonExtras: true,
            aiTutorEnabled: false,
            course: {hasTextToSpeech: false, hasLessonExtras: false},
          },
        ]
  );

  const updateSection = (sectionIdx, keyToUpdate, val) => {
    const newSections = sections.map((section, idx) => {
      if (idx === sectionIdx) {
        return {
          ...section,
          [keyToUpdate]: val,
        };
      } else {
        return section;
      }
    });
    setSections(newSections);
  };

  return [sections, updateSection];
};

export default function SectionsSetUpContainer({
  isUsersFirstSection,
  sectionToBeEdited,
  canEnableAITutor,
  userCountry,
}) {
  const [sections, updateSection] = useSections(sectionToBeEdited);
  const [isCoteacherOpen, setIsCoteacherOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [isSaveInProgress, setIsSaveInProgress] = useState(false);
  const [coteachersToAdd, setCoteachersToAdd] = useState([]);

  const isNewSection = !sectionToBeEdited;
  const initialSectionRef = useRef(sectionToBeEdited);

  const caret = isOpen => (isOpen ? 'caret-down' : 'caret-right');

  const toggleIsCoteacherOpen = useCallback(
    e => {
      e.preventDefault();

      setIsCoteacherOpen(!isCoteacherOpen);
    },
    [isCoteacherOpen]
  );

  const toggleAdvancedSettingsOpen = useCallback(
    e => {
      e.preventDefault();

      setAdvancedSettingsOpen(!advancedSettingsOpen);
    },
    [advancedSettingsOpen]
  );

  const recordSectionSetupEvent = section => {
    const initialSection = initialSectionRef.current;
    /*
    We do not currently store version year on the section, and the version dropdown
    does not update it. We will need to query all course offerings or set up a new
    course offerings controller function to populate previousVersionYear and newVersionYear.
    */
    if (isNewSection) {
      analyticsReporter.sendEvent(
        EVENTS.COMPLETED_EVENT,
        {
          sectionUnitId: section.course?.unitId,
          sectionCurriculumLocalizedName: section.course?.displayName,
          sectionCurriculum: section.course?.courseOfferingId, //this is course Offering id
          sectionCurriculumVersionYear: section.course?.versionYear,
          sectionGrade: section.grade ? section.grade[0] : null,
          sectionLockSelection: section.restrictSection,
          sectionName: section.name,
          sectionPairProgramSelection: section.pairingAllowed,
          flowVersion: NEW,
        },
        PLATFORMS.BOTH
      );
    }
    /*
    We want to send a 'curriculum assigned' event if this is not a new section
    (the check for initialSection) and if we are changing the courseOffering
    or the unit (hence the checks before and after the ||).
    */
    if (
      (section.course?.courseOfferingId &&
        initialSection &&
        section.course?.courseOfferingId !==
          initialSection.course?.courseOfferingId) ||
      (section.course?.unitId &&
        initialSection &&
        section.course?.unitId !== initialSection.course?.unitId)
    ) {
      analyticsReporter.sendEvent(EVENTS.CURRICULUM_ASSIGNED, {
        sectionName: section.name,
        sectionId: section.id,
        sectionLoginType: section.loginType,
        previousUnitId: initialSection.course?.unitId,
        previousCourseId: initialSection.course?.courseOfferingId,
        previousCourseVersionId: initialSection.course?.versionId,
        previousVersionYear: null,
        newUnitId: section.course?.unitId,
        newCourseId: section.course?.courseOfferingId,
        newCourseVersionId: section.course?.courseVersionId,
        newVersionYear: null,
        flowVersion: NEW,
      });
    }
  };

  const saveSection = (section, createAnotherSection, coteachersToAdd) => {
    const shouldShowCelebrationDialogOnRedirect = !!isUsersFirstSection;
    // Determine data sources and save method based on new vs edit section
    const dataUrl = isNewSection
      ? SECTIONS_API
      : `${SECTIONS_API}/${section.id}`;
    const method = isNewSection ? 'POST' : 'PATCH';
    const loginType = isNewSection
      ? queryParams('loginType')
      : section.loginType;
    const participantType = isNewSection
      ? queryParams('participantType')
      : section.participantType;
    const redirectUrl = queryParams('redirectToPage');

    const form = document.querySelector(`#${FORM_ID}`);
    // If we find a missing field in the form, report which one and reset save status
    if (!form.checkValidity()) {
      form.reportValidity();
      setIsSaveInProgress(false);
      return;
    }

    // Checking that the csrf-token exists since it is disabled on test
    const csrfToken = document.querySelector('meta[name="csrf-token"]')
      ? document.querySelector('meta[name="csrf-token"]').attributes['content']
          .value
      : null;

    const computedGrades =
      participantType === 'student' ? section.grade : ['pl'];

    const section_data = {
      login_type: loginType,
      participant_type: participantType,
      course_offering_id: section.course?.courseOfferingId,
      course_version_id: section.course?.versionId,
      unit_id: section.course?.unitId,
      restrict_section: section.restrictSection,
      lesson_extras: section.lessonExtras,
      pairing_allowed: section.pairingAllowed,
      tts_autoplay_enabled: section.ttsAutoplayEnabled,
      sharing_disabled: section.sharingDisabled,
      ai_tutor_enabled: section.aiTutorEnabled,
      grades: computedGrades,
      instructor_emails: coteachersToAdd,
      ...section,
    };

    fetch(dataUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(section_data),
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        recordSectionSetupEvent(section);
        coteachersToAdd.forEach(() => {
          analyticsReporter.sendEvent(
            EVENTS.COTEACHER_INVITE_SENT,
            getCoteacherMetricInfoFromSection(section)
          );
        });
        // Redirect to the given redirectUrl if present, otherwise redirect to the
        // sections list on the homepage.
        let url =
          window.location.origin + (redirectUrl ? `/${redirectUrl}` : '/home');
        if (!redirectUrl) {
          if (createAnotherSection) {
            url += '?openAddSectionDialog=true';
          } else if (shouldShowCelebrationDialogOnRedirect) {
            url += '?showSectionCreationDialog=true';
          }
        }
        navigateToHref(url);
      })
      .catch(err => {
        setIsSaveInProgress(false);
        console.error(err);
      });
  };

  const consolidatedCourseData = () => {
    if (sections[0].courseOfferingId !== null) {
      return {
        courseOfferingId: sections[0].courseOfferingId,
        versionId: sections[0].courseVersionId,
        unitId: sections[0].unitId,
        hasLessonExtras: sections[0].lessonExtras,
        hasTextToSpeech: sections[0].ttsAutoplayEnabled,
        displayName: sections[0].courseDisplayName,
      };
    } else {
      return null;
    }
  };

  const onURLClick = () => {
    showVideoDialog(
      {
        autoplay: true,
        download:
          'https://videos.code.org/levelbuilder/gettingstarted-creatingclasssection_sm-mp4.mp4',
        enable_fallback: true,
        key: 'Gettting_Started_ClassSection',
        name: 'Creating a Class Section',
        src: 'https://www.youtube-nocookie.com/embed/4Wugxc80fNU/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=yPWQfa4CHbw&wmode=transparent',
      },
      true
    );
  };

  const renderChildAccountPolicyNotification = () => {
    const isEmailLoggin = queryParams('loginType') === 'email';
    const isStudentSection = queryParams('participantType') === 'student';
    const isCapCountry = ['US', 'RD'].includes(userCountry);
    // We want to display a Child Account Policy warning notification for US
    // teachers who are creating a new section with email logins.
    if (isCapCountry && isStudentSection && isEmailLoggin) {
      return (
        <Provider store={getStore()}>
          <Notification
            type={NotificationType.warning}
            notice=""
            details={i18n.childAccountPolicy_CreateSectionsWarning()}
            detailsLink="https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts"
            detailsLinkNewWindow={true}
            detailsLinkText={i18n.childAccountPolicy_LearnMore()}
            dismissible={false}
          />
        </Provider>
      );
    } else {
      return null;
    }
  };

  const renderExpandableSection = (
    sectionId,
    sectionTitle,
    sectionContent,
    isOpen,
    toggleIsOpen
  ) => {
    return (
      <div className={moduleStyles.withBorderBottom}>
        <Button
          id={sectionId}
          className={moduleStyles.advancedSettingsButton}
          styleAsText
          icon={caret(isOpen)}
          onClick={toggleIsOpen}
        >
          <Heading3>{sectionTitle()}</Heading3>
        </Button>
        <div>{isOpen && sectionContent()}</div>
      </div>
    );
  };

  const renderAdvancedSettings = () => {
    // TODO: this will probably eventually be a setting on the course similar to hasTextToSpeech
    // currently we're working towards piloting in Javalab in CSA only.
    const aiTutorAvailable =
      canEnableAITutor &&
      sections[0].course.displayName === 'Computer Science A';

    return renderExpandableSection(
      'uitest-expandable-settings',
      () => i18n.advancedSettings(),
      () => (
        <AdvancedSettingToggles
          updateSection={(key, val) => updateSection(0, key, val)}
          section={sections[0]}
          hasLessonExtras={sections[0].course.hasLessonExtras}
          hasTextToSpeech={sections[0].course.hasTextToSpeech}
          aiTutorAvailable={aiTutorAvailable}
          label={i18n.pairProgramming()}
        />
      ),
      advancedSettingsOpen,
      toggleAdvancedSettingsOpen
    );
  };

  const renderCoteacherSection = () => {
    const isCoTeacherManagementDisabled =
      sections[0].primaryInstructor?.ltiRosterSyncEnabled === true &&
      sections[0].loginType === 'ltiV1';

    return renderExpandableSection(
      'uitest-expandable-coteacher',
      () => (
        <div>
          {i18n.coteacherAdd()}
          <InfoHelpTip
            id={'coteacher-toggle-info'}
            content={i18n.coteacherAddTooltip()}
          />
        </div>
      ),
      () => (
        <CoteacherSettings
          sectionId={sections[0].id}
          sectionInstructors={sections[0].sectionInstructors}
          primaryTeacher={sections[0].primaryInstructor}
          setCoteachersToAdd={setCoteachersToAdd}
          coteachersToAdd={coteachersToAdd}
          sectionMetricInformation={getCoteacherMetricInfoFromSection(
            sections[0]
          )}
          disabled={isCoTeacherManagementDisabled}
        />
      ),
      isCoteacherOpen,
      toggleIsCoteacherOpen
    );
  };

  return (
    <form id={FORM_ID}>
      <div className={moduleStyles.containerWithMarginTop}>
        <Heading1>
          {isNewSection
            ? i18n.setUpClassSectionsHeader()
            : i18n.editSectionDetails()}
        </Heading1>
        {isNewSection && (
          <>
            <BodyTwoText className={moduleStyles.noMarginBottomParagraph}>
              {i18n.setUpClassSectionsSubheader()}
            </BodyTwoText>
            <BodyTwoText>
              <a onClick={onURLClick} className={moduleStyles.textPopUp}>
                {i18n.setUpClassSectionsSubheaderLink()}
              </a>
            </BodyTwoText>
          </>
        )}
      </div>

      {renderChildAccountPolicyNotification()}

      <SingleSectionSetUp
        sectionNum={1}
        section={sections[0]}
        updateSection={(key, val) => updateSection(0, key, val)}
        isNewSection={isNewSection}
      />

      <CurriculumQuickAssign
        id="uitest-curriculum-quick-assign"
        isNewSection={isNewSection}
        updateSection={(key, val) => updateSection(0, key, val)}
        sectionCourse={sections[0].course || consolidatedCourseData()}
        initialParticipantType={sections[0].participantType}
      />

      <div
        className={classnames(
          moduleStyles.containerWithMarginTop,
          moduleStyles.withBorderTop
        )}
      >
        {renderCoteacherSection()}
        {renderAdvancedSettings()}
      </div>
      <div
        className={classnames(
          moduleStyles.splitButtonsContainer,
          moduleStyles.containerWithMarginTop
        )}
      >
        {isNewSection && ( // Only show 'save and add another' button when creating a new section
          <Button
            className={moduleStyles.buttonLeft}
            icon="plus"
            text={i18n.addAnotherClassSection()}
            color={Button.ButtonColor.neutralDark}
            onClick={e => {
              e.preventDefault();
              saveSection(sections[0], true, coteachersToAdd);
            }}
          />
        )}
        <Button
          className={moduleStyles.buttonRight}
          id="uitest-save-section-changes"
          text={
            isSaveInProgress
              ? i18n.saving()
              : isNewSection
              ? i18n.finishCreatingSections()
              : i18n.save()
          }
          color={Button.ButtonColor.brandSecondaryDefault}
          disabled={isSaveInProgress}
          onClick={e => {
            e.preventDefault();
            setIsSaveInProgress(true);
            saveSection(sections[0], false, coteachersToAdd);
          }}
        />
      </div>
    </form>
  );
}

SectionsSetUpContainer.propTypes = {
  isUsersFirstSection: PropTypes.bool,
  sectionToBeEdited: PropTypes.object,
  canEnableAITutor: PropTypes.bool,
  userCountry: PropTypes.string,
};
