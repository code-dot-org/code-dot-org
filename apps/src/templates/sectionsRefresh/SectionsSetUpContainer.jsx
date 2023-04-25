import React, {useState} from 'react';
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

const FORM_ID = 'sections-set-up-container';
const SECTIONS_API = '/api/v1/sections';

// Custom hook to update the list of sections to create
// Currently, this hook returns two things:
//   - sections: list of objects that represent the sections to create
//   - updateSection: function to update the section at the given index
const useSections = () => {
  // added "default properties" for any new section
  const [sections, setSections] = useState([
    {
      pairingAllowed: true,
      restrictSection: false,
      ttsAutoplayEnabled: false,
      lessonExtras: true,
    },
  ]);

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

const saveSection = (e, section) => {
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

// TO DO: Add a prop to indicate if this is a new section or an existing section
export default function SectionsSetUpContainer() {
  const [sections, updateSection] = useSections();
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  const caret = advancedSettingsOpen ? 'caret-down' : 'caret-right';

  const toggleAdvancedSettingsOpen = () => {
    setAdvancedSettingsOpen(!advancedSettingsOpen);
  };

  return (
    <form id={FORM_ID}>
      <Heading1>{i18n.setUpClassSectionsHeader()}</Heading1>
      <BodyOneText>{i18n.setUpClassSectionsSubheader()}</BodyOneText>
      <BodyOneText>
        <a href="https://www.youtube.com/watch?v=4Wugxc80fNU">
          {i18n.setUpClassSectionsSubheaderLink()}
        </a>
      </BodyOneText>
      <SingleSectionSetUp
        sectionNum={1}
        section={sections[0]}
        updateSection={(key, val) => updateSection(0, key, val)}
      />
      <CurriculumQuickAssign
        updateSection={(key, val) => updateSection(0, key, val)}
        sectionCourse={sections[0].course}
      />
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
            assignedUnitTextToSpeechEnabled
            assignedUnitLessonExtrasAvailable
            label={i18n.pairProgramming()}
          />
        )}
      </div>
      <div className={moduleStyles.buttonsContainer}>
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
        <Button
          text={i18n.finishCreatingSections()}
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={e => saveSection(e, sections[0])}
        />
      </div>
    </form>
  );
}
