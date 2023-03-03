import React, {useState} from 'react';
import i18n from '@cdo/locale';
import SingleSectionSetUp from './SingleSectionSetUp';
import CurriculumQuickAssign from './CurriculumQuickAssign';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';

const FORM_ID = 'sections-set-up-container';
const SECTIONS_API = '/api/v1/sections';

// Custom hook to update the list of sections to create
// Currently, this hook returns two things:
//   - sections: list of objects that represent the sections to create
//   - updateSection: function to update the section at the given index
const useSections = () => {
  const [sections, setSections] = useState([{}]);

  const updateSection = (sectionIdx, keyToUpdate, val) => {
    const newSections = sections.map((section, idx) => {
      if (idx === sectionIdx) {
        return {
          ...section,
          [keyToUpdate]: val
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

  // TODO: remove this once login_type and participant_type are hooked up to
  // the form.
  const section_data = {
    login_type: 'word',
    participant_type: 'student',
    ...section
  };

  fetch(SECTIONS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(section_data)
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

export default function SectionsSetUpContainer() {
  const [sections, updateSection] = useSections();
  return (
    <form id={FORM_ID}>
      <h1>{i18n.setUpClassSectionsHeader()}</h1>
      <p>{i18n.setUpClassSectionsSubheader()}</p>
      <p>
        <a href="https://www.youtube.com/watch?v=4Wugxc80fNU">
          {i18n.setUpClassSectionsSubheaderLink()}
        </a>
      </p>
      <SingleSectionSetUp
        sectionNum={1}
        section={sections[0]}
        updateSection={(key, val) => updateSection(0, key, val)}
      />
      <CurriculumQuickAssign
        updateSection={(key, val) => updateSection(0, key, val)}
        sectionCourse={sections[0].course}
      />
      <div className={moduleStyles.buttonsContainer}>
        <Button
          icon="plus"
          text={i18n.addAnotherClassSection()}
          color="white"
          onClick={e => {
            e.preventDefault();
            console.log('Add Another Class Section clicked');
          }}
        />
        <Button
          text={i18n.finishCreatingSections()}
          color="purple"
          onClick={e => saveSection(e, sections[0])}
        />
      </div>
    </form>
  );
}
