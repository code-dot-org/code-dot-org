import React, {useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SingleSectionSetUp from './SingleSectionSetUp';
import CurriculumQuickAssign from './CurriculumQuickAssign';
import AdvancedSettingToggles from './AdvancedSettingToggles';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';
import {queryParams} from '@cdo/apps/code-studio/utils';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {navigateToHref} from '@cdo/apps/utils';

const FORM_ID = 'sections-set-up-container';
const SECTIONS_API = '/api/v1/sections';

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

const saveSection = (e, section, shouldShowCelebrationDialogOnRedirect) => {
  e.preventDefault();

  const form = document.querySelector(`#${FORM_ID}`);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const csrfToken = document.querySelector('meta[name="csrf-token"]')
    .attributes['content'].value;
  const loginType = queryParams('loginType');
  const participantType = queryParams('participantType');

  const section_data = {
    login_type: loginType,
    participant_type: participantType,
    ...section,
  };

  fetch(SECTIONS_API, {
    method: 'POST',
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
      // Redirect to the sections list.
      let redirectUrl = window.location.origin + '/home';
      if (shouldShowCelebrationDialogOnRedirect) {
        redirectUrl += '?showSectionCreationDialog=true';
      }
      navigateToHref(redirectUrl);
    })
    .catch(err => {
      // TODO: Design how we want to show errors.
      console.error(err);
    });
};

export default function SectionsSetUpContainer({
  isUsersFirstSection,
  sectionToBeEdited,
}) {
  const [sections, updateSection] = useSections(sectionToBeEdited);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  const isNewSection = !sectionToBeEdited;

  const caretStyle = style.caret;
  const caret = advancedSettingsOpen ? 'caret-down' : 'caret-right';

  const toggleAdvancedSettingsOpen = () => {
    setAdvancedSettingsOpen(!advancedSettingsOpen);
  };

  return (
    <form id={FORM_ID}>
      <h1>
        {isNewSection
          ? i18n.setUpClassSectionsHeader()
          : i18n.editSectionDetails()}
      </h1>
      {isNewSection && (
        <div>
          <p>{i18n.setUpClassSectionsSubheader()}</p>
          <p>
            <a href="https://www.youtube.com/watch?v=4Wugxc80fNU">
              {i18n.setUpClassSectionsSubheaderLink()}
            </a>
          </p>
        </div>
      )}
      <SingleSectionSetUp
        sectionNum={1}
        section={sections[0]}
        updateSection={(key, val) => updateSection(0, key, val)}
      />
      <CurriculumQuickAssign
        isNewSection={isNewSection}
        updateSection={(key, val) => updateSection(0, key, val)}
        sectionCourse={sections[0].course}
      />
      <span>
        <div style={style.div}>
          <hr />
          <FontAwesome
            id={'uitest-advanced-settings'}
            onClick={toggleAdvancedSettingsOpen}
            icon={caret}
            style={caretStyle}
          />
          <h3
            style={style.label}
            onClick={toggleAdvancedSettingsOpen}
            htmlFor={'uitest-advanced-settings'}
          >
            {i18n.advancedSettings()}
          </h3>
        </div>
      </span>
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
        <hr />
      </div>
      <div className={moduleStyles.buttonsContainer}>
        {/* TO DO: for the first iteration of this feature we will only have 
        participants create one section at a time.  For edit section redirects, 
        adding another section is not needed.  This can be uncommented when the
        functionality of adding another class section is ready.

        {isNewSection && (
          <Button
            icon="plus"
            text={i18n.addAnotherClassSection()}
            color="white"
            onClick={e => {
              e.preventDefault();
              console.log('Add Another Class Section clicked');
            }}
          />
        )}
        */}
        {/* TO DO: currently this button just changes text if it is a "new" or "editied"
        screen, depending on how we want the functionality of this button to work,
        this might mean creating a different button for the "edit" page */}
        <Button
          text={isNewSection ? i18n.finishCreatingSections() : i18n.save()}
          color="purple"
          onClick={e =>
            saveSection(e, sections[0], !!isUsersFirstSection && isNewSection)
          }
        />
      </div>
    </form>
  );
}

SectionsSetUpContainer.propTypes = {
  isUsersFirstSection: PropTypes.bool,
};

const style = {
  caret: {
    marginRight: 10,
  },
  label: {
    display: 'inline-block',
  },
  div: {
    cursor: 'pointer',
    flexGrow: 1,
  },
};

SectionsSetUpContainer.propTypes = {
  sectionToBeEdited: PropTypes.object,
};
