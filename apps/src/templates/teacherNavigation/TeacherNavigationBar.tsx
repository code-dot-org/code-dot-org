import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  generatePath,
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import i18n from '@cdo/locale';

import {asyncLoadSelectedSection} from './selectedSectionLoader';
import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

interface SectionsData {
  [sectionId: number]: {
    name: string;
    hidden: boolean;
    courseVersionName: string;
    unitName: string;
  };
}

const TeacherNavigationBar: React.FunctionComponent = () => {
  const sections = useSelector(
    (state: {teacherSections: {sections: SectionsData}}) =>
      state.teacherSections.sections
  );
  // console.log('lfm', {sections});

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);

  const selectedSectionId = useSelector(
    (state: {teacherSections: {selectedSectionId: number}}) =>
      state.teacherSections.selectedSectionId
  );

  const isLoadingSectionData = useSelector(
    (state: {teacherSections: {isLoadingSectionData: boolean}}) =>
      state.teacherSections.isLoadingSectionData
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

  let courseContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[];
  if (sections[selectedSectionId]?.unitName) {
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
  const {urlSectionId} = useParams();

  const [currentPathName, currentPathObject] = React.useMemo(() => {
    return (
      _.find(
        Object.entries(LABELED_TEACHER_NAVIGATION_PATHS),
        path => !!matchPath(path[1].absoluteUrl, location.pathname)
      ) || [null, null]
    );
  }, [location]);

  React.useEffect(() => {
    console.log('switch section');
    if (urlSectionId && parseInt(urlSectionId) !== selectedSectionId) {
      asyncLoadSelectedSection(urlSectionId);
    }
  }, [urlSectionId, selectedSectionId]);

  React.useEffect(() => {
    console.log('lfm bar loc', {location});
  }, [location]);

  const navigateToDifferentSection = (sectionId: number) => {
    if (currentPathObject?.absoluteUrl) {
      console.log(
        'lfm navigate to',
        generatePath(currentPathObject.absoluteUrl, {
          sectionId: sectionId,
          courseVersionName: sections[sectionId]?.courseVersionName,
          unitName: sections[sectionId]?.unitName,
        })
      );
      navigate(
        generatePath(currentPathObject.absoluteUrl, {
          sectionId: sectionId,
          courseVersionName: sections[sectionId]?.courseVersionName,
          unitName: sections[sectionId]?.unitName,
        })
      );
      // window.location.href =
      //   'http://localhost-studio.code.org:3000/teacher_dashboard' +
      //   generatePath(currentPathObject.absoluteUrl, {
      //     sectionId: sectionId,
      //     courseVersionName: sections[sectionId].courseVersionName,
      //     unitName: sections[sectionId].unitName,
      //   });
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
        courseVersionName={sections[selectedSectionId]?.courseVersionName}
        unitName={sections[selectedSectionId]?.unitName}
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
          selectedValue={String(selectedSectionId)}
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
