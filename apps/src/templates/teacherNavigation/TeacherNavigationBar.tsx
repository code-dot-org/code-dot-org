import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import i18n from '@cdo/locale';

import {
  LABELED_TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_PATHS,
} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

interface SectionsData {
  [sectionId: number]: {
    name: string;
    hidden: boolean;
  };
}

function getPathName(url: string): string {
  const match = url.match(/\/\d+\/([^\/?]+)/);
  const urlPath = match ? match[1] : '';

  // Since the keys are different than the values (ex. lessonMaterials: 'materials'),
  // but we reference the keys several times in this component, we want to return the
  // right key for the path we are currently on
  return (
    Object.entries(TEACHER_NAVIGATION_PATHS).find(
      ([, val]) => val === urlPath
    )?.[0] || ''
  );
}

const TeacherNavigationBar: React.FunctionComponent = () => {
  const {sectionId} = useParams();
  const sections = useSelector(
    (state: {teacherSections: {sections: SectionsData}}) =>
      state.teacherSections.sections
  );

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sectionId || ''
  );
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>('');

  const handleOptionClick = (pathKey: string) => {
    setSelectedOptionKey(pathKey);
  };

  useEffect(() => {
    const initialOptionKey = getPathName(window.location.pathname);
    setSelectedOptionKey(initialOptionKey);
  }, []);

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

  const coursecontentSectionTitle = getSectionHeader(i18n.courseContent());
  const courseContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] = [
    'courseOverview',
    'lessonMaterials',
    'calendar',
  ];

  const performanceSectionTitle = getSectionHeader(i18n.performance());
  const performanceContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['progress', 'assessments', 'projects', 'stats', 'textResponses'];

  const classroomContentSectionTitle = getSectionHeader(i18n.classroom());
  const classroomContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['manageStudents', 'settings'];

  const teacherNavigationBarContent = [
    {title: coursecontentSectionTitle, keys: courseContentKeys},
    {title: performanceSectionTitle, keys: performanceContentKeys},
    {title: classroomContentSectionTitle, keys: classroomContentKeys},
  ];

  const getSidebarOptionsForSection = (sidebarKeys: string[]) => {
    return sidebarKeys.map(key => (
      <SidebarOption
        key={'ui-test-sidebar-' + key}
        isSelected={selectedOptionKey === key}
        sectionId={+selectedSectionId}
        pathKey={key as keyof typeof LABELED_TEACHER_NAVIGATION_PATHS}
        onClick={() => handleOptionClick(key)}
      />
    ));
  };

  const navbarComponents = teacherNavigationBarContent.map(
    ({title, keys}, index) => {
      const sidebarOptions = getSidebarOptionsForSection(keys);

      return (
        <div key={`section-${index}`}>
          {title}
          {sidebarOptions}
        </div>
      );
    }
  );

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newSelectedSectionId = event.target.value;
    setSelectedSectionId(newSelectedSectionId);

    const currentUrl = window.location.href;

    // Replace the section ID in the URL
    const newUrl = currentUrl.replace(
      /sections\/\d+/,
      `sections/${newSelectedSectionId}`
    );

    window.location.href = newUrl;
  };

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
          onChange={handleDropdownChange}
          labelText=""
          size="m"
          selectedValue={selectedSectionId}
          className={styles.sectionDropdown}
          name="section-dropdown"
        />
        {navbarComponents.map(component => component)}
      </div>
    </nav>
  );
};

export default TeacherNavigationBar;
