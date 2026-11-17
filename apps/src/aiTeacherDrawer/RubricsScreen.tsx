import React, {useEffect} from 'react';

import {getStudentsForSection} from '@cdo/apps/code-studio/components/progress/teacherPanel/teacherPanelData';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  asyncLoadSectionData,
  selectSection,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import RubricContainer from './rubrics/RubricContainer';

import styles from './rubrics-screen.module.scss';

const RubricsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const sectionId = useAppSelector(state => selectedSectionSelector(state)?.id);
  const sectionsAreLoaded = useAppSelector(
    state => state.teacherSections.sectionsAreLoaded
  );

  useEffect(() => {
    if (!sectionsAreLoaded) {
      dispatch(asyncLoadSectionData());
    }
  }, [dispatch, sectionsAreLoaded]);

  // Picking a section from SectionSelector reloads the page with
  // ?section_id= set (see SectionSelector.jsx's reloadOnChange path).
  // Restoring that on load - both marking the section selected *and*
  // loading its student roster (StudentSelector hides itself entirely
  // when teacherSections.selectedStudents is empty) - is normally
  // TeacherPanel.jsx's job (loadInitialData does exactly this), but
  // TeacherPanel doesn't mount at all when ta-teacher-panel is active.
  // This mirrors that same pair of calls rather than reusing
  // asyncLoadSelectedSection/loadSectionStudentData - that helper also
  // touches the `manageStudents` reducer, which is only ever registered
  // on the teacher dashboard, not on a level page, and throws here.
  // Gated on sectionsAreLoaded because selectSection only takes effect
  // for an id already present in teacherSections.sectionIds.
  useEffect(() => {
    if (!sectionsAreLoaded) return;
    const sectionIdParam = queryParams('section_id');
    if (typeof sectionIdParam === 'string' && sectionIdParam) {
      dispatch(selectSection(sectionIdParam));
      getStudentsForSection().then(section => {
        if (section) {
          dispatch(setStudentsForCurrentSection(section.id, section.students));
        }
      });
    }
  }, [dispatch, sectionsAreLoaded]);

  const drawerRubric = useAppSelector(state => state.aiDiffChat.drawerRubric);

  if (!drawerRubric) return null;

  const {
    rubric,
    studentLevelInfo,
    levelName,
    parentLevelName,
    levelType,
    unitName,
    courseName,
  } = drawerRubric;
  const aiEnabled = !!rubric.learningGoals?.some(lg => lg?.aiEnabled);
  const onLevelForEvaluation =
    levelType !== 'BubbleChoice' &&
    (levelName === rubric.level?.name ||
      parentLevelName === rubric.level?.name);
  const reportingData = {unitName, courseName, levelName};

  return (
    <div className={styles.wrapper}>
      <RubricContainer
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        reportingData={reportingData}
        onLevelForEvaluation={onLevelForEvaluation}
        teacherHasEnabledAi={aiEnabled}
        open
        sectionId={sectionId}
      />
    </div>
  );
};

export default RubricsScreen;
