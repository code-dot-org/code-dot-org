import React, {useState, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import SingleSectionSetUp from './SingleSectionSetUp';
import CurriculumQuickAssign from './CurriculumQuickAssign';
import AdvancedSettingToggles from './AdvancedSettingToggles';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  BodyOneText,
  Heading1,
  Heading3,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

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

const saveSection = (section, isNewSection) => {
  // Determine data sources and save method based on new vs edit section
  const dataUrl = isNewSection ? SECTIONS_API : `${SECTIONS_API}/${section.id}`;
  const method = isNewSection ? 'POST' : 'PATCH';
  const loginType = isNewSection ? queryParams('loginType') : section.loginType;
  const participantType = isNewSection
    ? queryParams('participantType')
    : section.participantType;

  const form = document.querySelector(`#${FORM_ID}`);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const csrfToken = document.querySelector('meta[name="csrf-token"]')
    .attributes['content'].value;

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
    grades: section.grade,
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
    .then(response => response.json())
    .then(data => {
      // Redirect to the sections list.
      window.location.href = window.location.origin + '/home';
    })
    .catch(err => {
      // TODO: Design how we want to show errors.
      console.error(err);
    });
};

export default function SectionsSetUpContainer({sectionToBeEdited}) {
  const [sections, updateSection] = useSections(sectionToBeEdited);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [isSaveInProgress, setIsSaveInProgress] = useState(false);

  const isNewSection = !sectionToBeEdited;
  const initialSectionRef = useRef(sectionToBeEdited);

  const caret = advancedSettingsOpen ? 'caret-down' : 'caret-right';

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
      analyticsReporter.sendEvent(EVENTS.COMPLETED_EVENT, {
        sectionUnitId: section.course?.unitId,
        sectionCurriculumLocalizedName: section.course?.displayName,
        sectionCurriculum: section.course?.courseOfferingId, //this is course Offering id
        sectionCurriculumVersionYear: section.course?.versionYear,
        sectionGrade: section.grade ? section.grade[0] : null,
        sectionLockSelection: section.restrictSection,
        sectionName: section.name,
        sectionPairProgramSelection: section.pairingAllowed,
        flowVersion: NEW,
      });
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
            <BodyOneText className={moduleStyles.noMarginBottomParagraph}>
              {i18n.setUpClassSectionsSubheader()}
            </BodyOneText>
            <BodyOneText>
              <a href="https://www.youtube.com/watch?v=4Wugxc80fNU">
                {i18n.setUpClassSectionsSubheaderLink()}
              </a>
            </BodyOneText>
          </>
        )}
      </div>

      <SingleSectionSetUp
        sectionNum={1}
        section={sections[0]}
        updateSection={(key, val) => updateSection(0, key, val)}
      />

      <CurriculumQuickAssign
        isNewSection={isNewSection}
        updateSection={(key, val) => updateSection(0, key, val)}
        sectionCourse={sections[0].course}
        initialParticipantType={sections[0].participantType}
      />

      <div
        className={classnames(
          moduleStyles.containerWithMarginTop,
          moduleStyles.withBorderTopAndBottom
        )}
      >
        <Button
          id="uitest-advanced-settings"
          className={moduleStyles.advancedSettingsButton}
          styleAsText
          icon={caret}
          onClick={toggleAdvancedSettingsOpen}
        >
          <Heading3>{i18n.advancedSettings()}</Heading3>
        </Button>
        <div>
          {advancedSettingsOpen && (
            <AdvancedSettingToggles
              updateSection={(key, val) => updateSection(0, key, val)}
              section={sections[0]}
              hasLessonExtras={sections[0].course.hasLessonExtras}
              hasTextToSpeech={sections[0].course.hasTextToSpeech}
              label={i18n.pairProgramming()}
            />
          )}
        </div>
      </div>

      <div
        className={classnames(
          moduleStyles.buttonsContainer,
          moduleStyles.containerWithMarginTop
        )}
      >
        {/*
         TODO: for the first iteration of this feature we will only have
        participants create one section at a time.  For edit section redirects,
        adding another section is not needed.  This can be uncommented when the
        functionality of adding another class section is ready.

        {isNewSection && (
        <Button
          useDefaultLineHeight
          icon="plus"
          text={i18n.addAnotherClassSection()}
          color={Button.ButtonColor.neutralDark}
          onClick={e => {
            e.preventDefault();
            console.log('Add Another Class Section clicked');
          }}
        />
        */}
        {/*
        TODO: currently this button just changes text if it is a "new" or "editied"
        screen, depending on how we want the functionality of this button to work,
        this might mean creating a different button for the "edit" page
        */}
        <Button
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
            recordSectionSetupEvent(sections[0]);
            saveSection(sections[0], isNewSection);
          }}
        />
      </div>
    </form>
  );
}

SectionsSetUpContainer.propTypes = {
  sectionToBeEdited: PropTypes.object,
};
