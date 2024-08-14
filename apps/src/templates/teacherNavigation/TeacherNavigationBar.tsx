import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import i18n from '@cdo/locale';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

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

  const getSectionHeader = (label: string) => {
    return (
      <Typography
        semanticTag={'h2'}
        visualAppearance={'overline-two'}
        className={styles.sectionHeader}
      >
        {label}
      </Typography>
    );
  };

  const courseContent = [
    getSectionHeader(i18n.courseContent()),
    <SidebarOption
      icon={'desktop'}
      optionTitle={i18n.course()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'folder-open'}
      optionTitle={i18n.lessonMaterials()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'file-lines'}
      optionTitle={i18n.lessonPlans()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'presentation-screen'}
      optionTitle={i18n.slideDecks()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'calendar'}
      optionTitle={i18n.calendar()}
      isSelected={false}
    />,
  ];

  const performanceContent = [
    getSectionHeader(i18n.performance()),
    <SidebarOption
      icon={'chart-line'}
      optionTitle={LABELED_TEACHER_NAVIGATION_PATHS.progress.label}
      isSelected={false}
    />,
    <SidebarOption
      icon={'star'}
      optionTitle={LABELED_TEACHER_NAVIGATION_PATHS.assessments.label}
      isSelected={false}
    />,
    <SidebarOption
      icon={'code'}
      optionTitle={LABELED_TEACHER_NAVIGATION_PATHS.projects.label}
      isSelected={true}
    />,
    <SidebarOption
      icon={'chart-simple'}
      optionTitle={LABELED_TEACHER_NAVIGATION_PATHS.stats.label}
      isSelected={false}
    />,
    <SidebarOption
      icon={'pen-line'}
      optionTitle={LABELED_TEACHER_NAVIGATION_PATHS.textResponses.label}
      isSelected={false}
    />,
  ];

  const classroomContent = [
    getSectionHeader(i18n.classroom()),
    <SidebarOption
      icon={'users'}
      optionTitle={LABELED_TEACHER_NAVIGATION_PATHS.manageStudents.label}
      isSelected={false}
    />,
    <SidebarOption
      icon={'gear'}
      optionTitle={i18n.settings()}
      isSelected={false}
    />,
  ];

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
