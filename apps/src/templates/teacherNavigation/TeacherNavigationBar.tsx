import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
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
  const [selectedOptionKey, setSelectedOptionKey] =
    useState<string>('assessments');

  const handleOptionClick = (pathKey: string) => {
    setSelectedOptionKey(pathKey);
  };

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
      isSelected={selectedOptionKey === 'courseOverview'}
      sectionId={+selectedSectionId}
      pathKey={'courseOverview'}
      onClick={() => handleOptionClick('courseOverview')}
    />,
    <SidebarOption
      sectionId={+selectedSectionId}
      icon={'folder-open'}
      isSelected={selectedOptionKey === 'lessonMaterials'}
      pathKey={'lessonMaterials'}
      onClick={() => handleOptionClick('lessonMaterials')}
    />,
    <SidebarOption
      icon={'calendar'}
      isSelected={selectedOptionKey === 'calendar'}
      sectionId={+selectedSectionId}
      pathKey={'calendar'}
      onClick={() => handleOptionClick('calendar')}
    />,
  ];

  const performanceContent = [
    getSectionHeader(i18n.performance()),
    <SidebarOption
      icon={'chart-line'}
      isSelected={selectedOptionKey === 'progress'}
      sectionId={+selectedSectionId}
      pathKey={'progress'}
      onClick={() => handleOptionClick('progress')}
    />,
    <SidebarOption
      icon={'star'}
      isSelected={selectedOptionKey === 'assessments'}
      sectionId={+selectedSectionId}
      pathKey={'assessments'}
      onClick={() => handleOptionClick('assessments')}
    />,
    <SidebarOption
      icon={'code'}
      isSelected={selectedOptionKey === 'projects'}
      sectionId={+selectedSectionId}
      pathKey={'projects'}
      onClick={() => handleOptionClick('projects')}
    />,
    <SidebarOption
      icon={'chart-simple'}
      isSelected={selectedOptionKey === 'stats'}
      sectionId={+selectedSectionId}
      pathKey={'stats'}
      onClick={() => handleOptionClick('stats')}
    />,
    <SidebarOption
      icon={'pen-line'}
      isSelected={selectedOptionKey === 'textResponses'}
      sectionId={+selectedSectionId}
      pathKey={'textResponses'}
      onClick={() => handleOptionClick('textResponses')}
    />,
  ];

  const classroomContent = [
    getSectionHeader(i18n.classroom()),
    <SidebarOption
      icon={'users'}
      isSelected={selectedOptionKey === 'manageStudents'}
      sectionId={+selectedSectionId}
      pathKey={'manageStudents'}
      onClick={() => handleOptionClick('manageStudents')}
    />,
    <SidebarOption
      icon={'gear'}
      isSelected={selectedOptionKey === 'settings'}
      sectionId={+selectedSectionId}
      pathKey={'settings'}
      onClick={() => handleOptionClick('settings')}
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
