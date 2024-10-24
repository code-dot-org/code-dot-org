import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {
  generatePath,
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import {asyncLoadSelectedSection} from './selectedSectionLoader';
import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

const TeacherNavigationBar: React.FunctionComponent = () => {
  const sections = useAppSelector(state => state.teacherSections.sections);

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const isLoadingSectionData = useAppSelector(
    state => state.teacherSections.isLoadingSectionData
  );

  useEffect(() => {
    const updatedSectionArray = Object.entries(sections)
      .filter(([id, section]) => !section.hidden)
      .map(([id, section]) => ({
        value: id,
        text: section.name,
      }));

    setSectionArray(updatedSectionArray);
  }, [sections, selectedSection]);

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

  let courseContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[];
  if (selectedSection.unitName) {
    courseContentKeys = ['unitOverview', 'lessonMaterials', 'calendar'];
  } else {
    courseContentKeys = ['courseOverview', 'lessonMaterials', 'calendar'];
  }

  const performanceSectionTitle = getSectionHeader(i18n.performance());
  const performanceContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['progress', 'assessments', 'projects', 'stats', 'textResponses'];

  const classroomContentSectionTitle = getSectionHeader(i18n.classroom());
  const classroomContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['roster', 'settings'];

  const teacherNavigationBarContent = [
    {title: coursecontentSectionTitle, keys: courseContentKeys},
    {title: performanceSectionTitle, keys: performanceContentKeys},
    {title: classroomContentSectionTitle, keys: classroomContentKeys},
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const urlSectionId = useParams().sectionId;

  const [currentPathName, currentPathObject] = React.useMemo(() => {
    return (
      _.find(
        Object.entries(LABELED_TEACHER_NAVIGATION_PATHS),
        path => !!matchPath(path[1].absoluteUrl, location.pathname)
      ) || [null, null]
    );
  }, [location]);

  React.useEffect(() => {
    if (urlSectionId && parseInt(urlSectionId) !== selectedSection.id) {
      asyncLoadSelectedSection(urlSectionId);
    }
  }, [urlSectionId, selectedSection.id]);

  const navigateToDifferentSection = (sectionId: number) => {
    if (currentPathObject?.absoluteUrl) {
      navigate(
        generatePath(currentPathObject.absoluteUrl, {
          sectionId: sectionId,
          courseVersionName: sections[sectionId]?.courseVersionName,
          unitName: sections[sectionId]?.unitName,
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
        sectionId={+selectedSection.id}
        courseVersionName={selectedSection.courseVersionName}
        unitName={selectedSection.unitName}
        pathKey={key as keyof typeof LABELED_TEACHER_NAVIGATION_PATHS}
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
          onChange={event =>
            navigateToDifferentSection(parseInt(event.target.value))
          }
          labelText=""
          size="m"
          selectedValue={String(selectedSection.id)}
          className={styles.sectionDropdown}
          name="section-dropdown"
          color="gray"
          disabled={isLoadingSectionData}
        />
        {navbarComponents.map(component => component)}
      </div>
    </nav>
  );
};

export default TeacherNavigationBar;
