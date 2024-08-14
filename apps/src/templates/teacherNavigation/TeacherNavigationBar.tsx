import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  useLocation,
  useParams,
  matchPath,
  generatePath,
  useNavigate,
} from 'react-router-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import Typography from '@cdo/apps/componentLibrary/typography';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_PATHS} from './TeacherDashboardPaths';

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

  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const genericPath = React.useMemo(() => {
    return _.find(
      Object.values(TEACHER_NAVIGATION_PATHS),
      path => !!matchPath(path, location.pathname)
    );
  }, [location]);

  useEffect(() => {
    const updatedSectionArray = Object.entries(sections)
      .filter(([id, section]) => !section.hidden)
      .map(([id, section]) => ({
        value: String(id),
        text: section.name,
      }));

    setSectionArray(updatedSectionArray);
  }, [sections]);

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
      optionTitle={i18n.progress()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'star'}
      optionTitle={i18n.assessments()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'code'}
      optionTitle={i18n.studentProjects()}
      isSelected={true}
    />,
    <SidebarOption
      icon={'chart-simple'}
      optionTitle={i18n.teacherTabStats()}
      isSelected={false}
    />,
    <SidebarOption
      icon={'pen-line'}
      optionTitle={i18n.teacherTabStatsTextResponses()}
      isSelected={false}
    />,
  ];

  const classroomContent = [
    getSectionHeader(i18n.classroom()),
    <SidebarOption
      icon={'users'}
      optionTitle={i18n.roster()}
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
          onChange={value => {
            if (genericPath) {
              navigate(
                generatePath(genericPath, {sectionId: value.target.value})
              );
            }
          }}
          labelText=""
          size="m"
          selectedValue={params.sectionId}
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
