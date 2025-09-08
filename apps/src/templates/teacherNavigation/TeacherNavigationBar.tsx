import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import Tags from '@code-dot-org/component-library/tags';
import Typography from '@code-dot-org/component-library/typography';
import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {
  generatePath,
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SidebarOption from '@cdo/apps/templates/teacherNavigation/SidebarOption';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';

import {asyncLoadSelectedSection} from './selectedSectionLoader';
import {
  LABELED_TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_PATH_NAMES,
  TEACHER_NAVIGATION_PATHS,
} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

const TeacherNavigationBar: React.FC<{
  showAITutorTab: boolean;
}> = ({showAITutorTab}) => {
  const {sections, sectionOrder} = useAppSelector(
    state => state.teacherSections
  );

  const [sectionArray, setSectionArray] = useState<
    {value: string; text: string}[]
  >([]);

  const selectedSection = useAppSelector(selectedSectionSelector);

  const isLoadingSectionData = useAppSelector(
    state => state.teacherSections.isLoadingSectionData
  );

  const aiDifferentiationEnabled = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );

  useEffect(() => {
    const updatedSectionArray = sectionOrder
      .map(sectionId => sections[sectionId] || null)
      .filter(section => section !== null)
      .filter(section => !section.hidden)
      .map(section => ({
        value: section.id.toString(),
        text: section.name,
      }));

    setSectionArray(updatedSectionArray);
  }, [sections, selectedSection, sectionOrder]);

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
    if (urlSectionId && parseInt(urlSectionId) !== selectedSection?.id) {
      asyncLoadSelectedSection(urlSectionId);
    }
  }, [urlSectionId, selectedSection?.id]);

  const coursecontentSectionTitle = getSectionHeader(i18n.courseContent());

  let courseContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[];
  if (selectedSection?.unitName) {
    if (experiments.isEnabled(experiments.MODULARITY)) {
      courseContentKeys = ['nestedUnitOverview', 'lessonMaterials', 'calendar'];
    } else {
      courseContentKeys = ['unitOverview', 'lessonMaterials', 'calendar'];
    }
  } else {
    courseContentKeys = ['courseOverview', 'lessonMaterials', 'calendar'];
  }

  const performanceSectionTitle = getSectionHeader(i18n.performance());

  const performanceContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['progress', 'assessments', 'projects', 'stats', 'textResponses'];

  if (showAITutorTab) {
    performanceContentKeys.splice(1, 0, 'aiTutor');
  }

  const classroomContentSectionTitle = getSectionHeader(i18n.classroom());
  const classroomContentKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[] =
    ['roster', 'settings'];

  const teacherNavigationBarContent = [
    {
      title: coursecontentSectionTitle,
      keys: courseContentKeys,
      sectionTag: (
        <Tags tagsList={[{label: 'New'}]} className={styles.sidebarNewTags} />
      ),
    },
    {
      title: performanceSectionTitle,
      keys: performanceContentKeys,
      sectionTag: null,
    },
    {
      title: classroomContentSectionTitle,
      keys: classroomContentKeys,
      sectionTag: null,
    },
  ];

  const navigateToDifferentSection = (sectionId: number) => {
    if (currentPathObject?.absoluteUrl) {
      if (
        currentPathObject.url === TEACHER_NAVIGATION_PATHS.courseOverview ||
        currentPathObject.url === TEACHER_NAVIGATION_PATHS.unitOverview ||
        currentPathObject.url === TEACHER_NAVIGATION_PATHS.nestedUnitOverview
      ) {
        let overviewUrl =
          LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl;
        if (sections[sectionId]?.unitName) {
          if (experiments.isEnabled(experiments.MODULARITY)) {
            overviewUrl =
              LABELED_TEACHER_NAVIGATION_PATHS.nestedUnitOverview.absoluteUrl;
          } else {
            overviewUrl =
              LABELED_TEACHER_NAVIGATION_PATHS.unitOverview.absoluteUrl;
          }
        }
        navigate(
          generatePath(overviewUrl, {
            sectionId: sectionId,
            courseVersionName: sections[sectionId]?.courseVersionName,
            unitName: sections[sectionId]?.unitName,
            unitPosition: sections[sectionId]?.unitPosition,
          })
        );
      } else {
        navigate(
          generatePath(currentPathObject.absoluteUrl, {
            sectionId: sectionId,
            courseVersionName: sections[sectionId]?.courseVersionName,
            unitName: sections[sectionId]?.unitName,
            unitPosition: sections[sectionId]?.unitPosition,
          })
        );
      }

      analyticsReporter.sendEvent(EVENTS.NAVIGATE_TO_SECTION, {
        sectionId: sectionId,
        currentPage: currentPathName,
      });
    }
  };

  const isOptionSelected = React.useCallback(
    (key: string) => {
      return (
        currentPathName === key ||
        (currentPathName === TEACHER_NAVIGATION_PATH_NAMES.courseOverview &&
          key === TEACHER_NAVIGATION_PATH_NAMES.unitOverview) ||
        (currentPathName === TEACHER_NAVIGATION_PATH_NAMES.unitOverview &&
          key === TEACHER_NAVIGATION_PATH_NAMES.courseOverview) ||
        (currentPathName === TEACHER_NAVIGATION_PATH_NAMES.nestedUnitOverview &&
          key === TEACHER_NAVIGATION_PATH_NAMES.courseOverview)
      );
    },
    [currentPathName]
  );

  const getSidebarOptionsForSection = (
    sidebarKeys: (keyof typeof LABELED_TEACHER_NAVIGATION_PATHS)[]
  ) => {
    if (!selectedSection) {
      return [];
    }
    return sidebarKeys.map(key => (
      <SidebarOption
        key={'ui-test-sidebar-' + key}
        isSelected={isOptionSelected(key)}
        sectionId={selectedSection.id}
        courseVersionName={selectedSection.courseVersionName}
        unitPosition={selectedSection.unitPosition}
        unitName={selectedSection.unitName}
        pathKey={key as keyof typeof LABELED_TEACHER_NAVIGATION_PATHS}
      />
    ));
  };

  const navbarComponents = teacherNavigationBarContent.map(
    ({title, keys, sectionTag}, index) => {
      const sidebarOptions = getSidebarOptionsForSection(keys);

      return (
        <div key={`section-${index}`}>
          <div className={styles.sidebarSectionHeader}>
            {title}
            {sectionTag}
          </div>
          {sidebarOptions}
        </div>
      );
    }
  );

  const aiContext = () => {
    if (selectedSection?.courseId && selectedSection?.unitId)
      return {
        type: AiDiffContext.COURSE,
        courseId: selectedSection.courseId,
        unitId: selectedSection.unitId,
      };
    if (selectedSection?.courseId)
      return {
        type: AiDiffContext.COURSE,
        courseId: selectedSection.courseId,
      };
    if (selectedSection?.unitId)
      return {
        type: AiDiffContext.UNIT,
        unitId: selectedSection.unitId,
      };
    return {
      type: AiDiffContext.GENERAL,
    };
  };

  return (
    <nav className={styles.sidebarContainer} id="ui-test-teacher-sidebar">
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
          selectedValue={String(selectedSection?.id)}
          className={styles.sectionDropdown}
          name="section-dropdown"
          id="uitest-sidebar-section-dropdown"
          color="gray"
          disabled={isLoadingSectionData || !selectedSection}
        />
        {navbarComponents.map(component => component)}
      </div>
      {aiDifferentiationEnabled &&
        experiments.isEnabled('ai-differentiation') && (
          <AiDiffFloatingActionButton
            context={aiContext()}
            scriptName={selectedSection?.courseVersionName}
          />
        )}
    </nav>
  );
};

export default TeacherNavigationBar;
