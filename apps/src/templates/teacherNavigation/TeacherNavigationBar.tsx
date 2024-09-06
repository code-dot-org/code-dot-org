import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  generatePath,
  matchPath,
  useLocation,
  useNavigate,
} from 'react-router-dom';

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

  const selectedSectionId = useSelector(
    (state: {teacherSections: {selectedSectionId: number}}) =>
      state.teacherSections.selectedSectionId
  );

  useEffect(() => {
    const updatedSectionArray = Object.entries(sections)
      .filter(([id, section]) => !section.hidden)
      .map(([id, section]) => ({
        value: id,
        text: section.name,
      }));

    setSectionArray(updatedSectionArray);
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

  const navigate = useNavigate();
  const location = useLocation();

  const [currentPathName, currentPathObject] = React.useMemo(() => {
    return (
      _.find(
        Object.entries(LABELED_TEACHER_NAVIGATION_PATHS),
        path => !!matchPath(path[1].absoluteUrl, location.pathname)
      ) || [null, null]
    );
  }, [location]);

  const navigateToDifferentSection = (sectionId: string) => {
    if (currentPathObject?.absoluteUrl) {
      navigate(
        generatePath(currentPathObject.absoluteUrl, {sectionId: sectionId})
      );
    }
  };

  const navigateToDifferentPage = (
    page: keyof typeof LABELED_TEACHER_NAVIGATION_PATHS
  ) => {
    if (LABELED_TEACHER_NAVIGATION_PATHS[page]) {
      navigate(
        generatePath(LABELED_TEACHER_NAVIGATION_PATHS[page].absoluteUrl, {
          sectionId: selectedSectionId,
        })
      );
    }
  };

  const getSidebarOptionsForSection = (
    sidebarKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[]
  ) => {
    return sidebarKeys.map(key => (
      <SidebarOption
        key={'ui-test-sidebar-' + key}
        isSelected={currentPathName === key}
        sectionId={+selectedSectionId}
        pathKey={key as keyof typeof LABELED_TEACHER_NAVIGATION_PATHS}
        onClick={() => navigateToDifferentPage(key)}
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
          onChange={event => navigateToDifferentSection(event.target.value)}
          labelText=""
          size="m"
          selectedValue={String(selectedSectionId)}
          className={styles.sectionDropdown}
          name="section-dropdown"
          color="gray"
        />
        {navbarComponents.map(component => component)}
      </div>
    </nav>
  );
};

export default TeacherNavigationBar;
