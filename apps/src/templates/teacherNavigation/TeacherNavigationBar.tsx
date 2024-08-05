import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import styles from './teacher-navigation.module.scss';

interface SectionsData {
  [sectionId: number]: {
    name: string;
    hidden: boolean;
  };
}

const TeacherNavigationBar: React.FunctionComponent = () => {
  const sectionList = useSelector(
    (state: {teacherSections: {sections: SectionsData}}) =>
      state.teacherSections.sections
  );

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | ''>('');

  useEffect(() => {
    const updatedSectionArray = Object.entries(sectionList)
      .filter(([id, section]) => !section.hidden)
      .map(([id, section]) => ({
        value: String(id),
        text: section.name,
      }));

    setSectionArray(updatedSectionArray);

    // Set initial selectedSectionId if not already set
    if (updatedSectionArray.length > 0 && !selectedSectionId) {
      setSelectedSectionId(updatedSectionArray[0].value);
    }
  }, [sectionList, selectedSectionId]);

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarContent}>
        <Typography
          semanticTag={'h2'}
          visualAppearance={'overline-two'}
          className={styles.sectionHeader}
        >
          {i18n.classSections()}
        </Typography>
        <SimpleDropdown
          items={sectionArray}
          onChange={value => setSelectedSectionId(value.target.value)}
          labelText=""
          size="m"
          selectedValue={selectedSectionId}
          name="section-dropdown"
        />
      </div>
    </div>
  );
};

export default TeacherNavigationBar;
