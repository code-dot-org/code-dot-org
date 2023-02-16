import React, {useState} from 'react';
import i18n from '@cdo/locale';
import SingleSectionSetUp from './SingleSectionSetUp';
import CurriculumQuickAssign from './CurriculumQuickAssign';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';

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

export default function SectionsSetUpContainer() {
  const [sections, updateSection] = useSections();
  return (
    <div>
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
      <CurriculumQuickAssign getOfferings={() => {}} />
      <div className={moduleStyles.buttonsContainer}>
        <Button
          icon="plus"
          text={i18n.addAnotherClassSection()}
          color="white"
          onClick={() => console.log('Add Another Class Section clicked')}
        />
        <Button
          text={i18n.saveClassSections()}
          color="purple"
          onClick={() => console.log('Save class sections clicked')}
        />
      </div>
    </div>
  );
}
