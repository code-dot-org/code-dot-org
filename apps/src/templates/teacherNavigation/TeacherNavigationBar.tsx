import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import TeacherNavigationSidebarOption from '@cdo/apps/templates/teacherNavigation/TeacherNavigationSidebarOption';
import i18n from '@cdo/locale';

import styles from './teacher-navigation.module.scss';

interface SectionsData {
  [sectionId: number]: {
    name: string;
    hidden: boolean;
  };
}

const TeacherNavigationBar: React.FunctionComponent = () => {
  const sections = useSelector(
    (state: {teacherSections: {sections: SectionsData}}) =>
      state.teacherSections.sections
  );

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  useEffect(() => {
    const updatedSectionArray = Object.entries(sections)
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
  }, [sections, selectedSectionId]);

  const courseContent = (
    <>
      <Typography
        semanticTag={'h2'}
        visualAppearance={'overline-two'}
        className={styles.sectionHeader}
      >
        {i18n.courseContent()}
      </Typography>
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.course()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.lessonMaterials()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.lessonPlans()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.slideDecks()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.calendar()}
        isSelected={false}
      />
    </>
  );

  const performanceContent = (
    <>
      <Typography
        semanticTag={'h2'}
        visualAppearance={'overline-two'}
        className={styles.sectionHeader}
      >
        {i18n.performance()}
      </Typography>
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.progress()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.assessments()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.studentProjects()}
        isSelected={true}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.teacherTabStats()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.teacherTabStatsTextResponses()}
        isSelected={false}
      />
    </>
  );

  const classroomContent = (
    <>
      <Typography
        semanticTag={'h2'}
        visualAppearance={'overline-two'}
        className={styles.sectionHeader}
      >
        {i18n.classroom()}
      </Typography>
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.roster()}
        isSelected={false}
      />
      <TeacherNavigationSidebarOption
        icon={'split'}
        optionTitle={i18n.settings()}
        isSelected={false}
      />
    </>
  );

  return (
    <nav className={styles.sidebarContainer}>
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
          className={styles.sectionDropdown}
          name="section-dropdown"
        />
        {courseContent}
        {performanceContent}
        {classroomContent}
      </div>
    </nav>
  );
};

export default TeacherNavigationBar;
