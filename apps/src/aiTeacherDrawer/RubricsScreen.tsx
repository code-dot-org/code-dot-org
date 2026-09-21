import React, {useMemo} from 'react';

import {setChatIsOpen} from '@cdo/apps/aiTeacherDrawer/redux';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {Rubric, StudentLevelInfo} from '@cdo/apps/types/rubricTypes';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import RubricContainer from './rubrics/RubricContainer';

import styles from './rubrics-screen.module.scss';

interface RubricDataAttr {
  rubric: Rubric;
  studentLevelInfo?: StudentLevelInfo | null;
  parentLevelName?: string;
  levelType?: string;
}

interface LevelDataAttr {
  script_name: string;
  course_name: string;
  level_name: string;
}

function readAttr<T>(selector: string, key: string): T | null {
  const el = document.querySelector<HTMLScriptElement>(selector);
  if (!el?.dataset[key]) return null;
  try {
    return JSON.parse(el.dataset[key] as string) as T;
  } catch {
    return null;
  }
}

// Mirrors what apps/src/sites/studio/pages/levels/show.js reads to build
// RubricFloatingActionButton's props, so this screen can reconstruct the
// same data from a separate React root (the drawer's) without needing
// show.js to route anything to us directly.
const RubricsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const sectionId = useAppSelector(state => selectedSectionSelector(state)?.id);

  const rubricData = useMemo(
    () => readAttr<RubricDataAttr>('script[data-rubricdata]', 'rubricdata'),
    []
  );
  const levelData = useMemo(
    () => readAttr<LevelDataAttr>('script[data-level]', 'level'),
    []
  );

  if (!rubricData?.rubric) return null;

  const {rubric, studentLevelInfo, parentLevelName, levelType} = rubricData;
  const aiEnabled = !!rubric.learningGoals?.some(lg => lg?.aiEnabled);
  const onLevelForEvaluation =
    levelType !== 'BubbleChoice' &&
    (levelData?.level_name === rubric.level?.name ||
      parentLevelName === rubric.level?.name);
  const reportingData = {
    unitName: levelData?.script_name,
    courseName: levelData?.course_name,
    levelName: levelData?.level_name,
  };

  return (
    <div className={styles.wrapper}>
      <RubricContainer
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        reportingData={reportingData}
        onLevelForEvaluation={onLevelForEvaluation}
        teacherHasEnabledAi={aiEnabled}
        open
        closeRubric={() => dispatch(setChatIsOpen(false))}
        sectionId={sectionId}
      />
    </div>
  );
};

export default RubricsScreen;
