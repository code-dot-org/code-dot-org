import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import i18n from '@cdo/locale';

import {
  TEACHER_DASHBOARD_PATHS,
  getSectionRouterPath,
} from '../teacherDashboard/teacherNavigation/TeacherDashboardPaths';

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

  // later
  // const [selectedOptionPath, setSelectedOptionPath] = useState<string>('');

  // const isSelectedOption = (path: string) => {
  //   path === selectedOptionPath;
  // };

  const getSectionHeader = (label: string) => {
    return (
      <Typography
        semanticTag={'h2'}
        visualAppearance={'overline-two'}
        className={styles.sectionHeader}
        key={label}
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
      link={'/progress1'}
      key={'/progress1'}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'folder-open'}
      optionTitle={i18n.lessonMaterials()}
      isSelected={false}
      link={'/progress2'}
      key={'/progress2'}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'file-lines'}
      optionTitle={i18n.lessonPlans()}
      isSelected={false}
      link={'/progress3'}
      key={'/progress3'}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'presentation-screen'}
      optionTitle={i18n.slideDecks()}
      isSelected={false}
      link={'/progress4'}
      key={'/progress4'}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'calendar'}
      optionTitle={i18n.calendar()}
      isSelected={false}
      link={'/progress5'}
      key={'/progress5'}
      sectionId={+selectedSectionId}
    />,
  ];

  const performanceContent = [
    getSectionHeader(i18n.performance()),
    <SidebarOption
      icon={'chart-line'}
      optionTitle={i18n.progress()}
      isSelected={false}
      link={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.progress)}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'star'}
      optionTitle={i18n.assessments()}
      isSelected={false}
      link={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.assessments)}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'code'}
      optionTitle={i18n.studentProjects()}
      isSelected={true}
      link={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.projects)}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'chart-simple'}
      optionTitle={i18n.teacherTabStats()}
      isSelected={false}
      link={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.stats)}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'pen-line'}
      optionTitle={i18n.teacherTabStatsTextResponses()}
      isSelected={false}
      link={getSectionRouterPath(TEACHER_DASHBOARD_PATHS.textResponses)}
      sectionId={+selectedSectionId}
    />,
  ];

  const classroomContent = [
    getSectionHeader(i18n.classroom()),
    <SidebarOption
      icon={'users'}
      optionTitle={i18n.roster()}
      isSelected={false}
      link={'/progress6'}
      key={'/progress6'}
      sectionId={+selectedSectionId}
    />,
    <SidebarOption
      icon={'gear'}
      optionTitle={i18n.settings()}
      isSelected={false}
      link={'/progress7'}
      key={'/progress7'}
      sectionId={+selectedSectionId}
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
