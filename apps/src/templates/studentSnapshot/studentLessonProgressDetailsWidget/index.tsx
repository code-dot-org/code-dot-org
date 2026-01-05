import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import WidgetTemplate from '../widgetTemplate';

import styles from './studentLessonProgressDetailsWidget.module.scss';

interface StudentLessonProgressDetailsWidgetProps {
  selectedUnitId: number;
  selectedLessonId: number;
  selectedStudentId: number;
}

interface UserProgressInLessonData {
  [userId: number]: {
    progress: number | null;
    timeSpent: string | null;
  };
}

interface UserValidationProgressByLessonData {
  [lessonId: string]: {
    [userId: string]: number;
  };
}

const COMPLETED_STATUSES: string[] = [
  LevelStatus.completed_assessment,
  LevelStatus.free_play_complete,
  LevelStatus.passed,
  LevelStatus.perfect,
  LevelStatus.review_accepted,
  LevelStatus.submitted,
];

const COMPLETE_PERCENT_STRING = '100% complete';
const ZERO_TIME_SPENT = '00:00:00';

const formatTimeSpent = (secondsSpent: number) => {
  if (!secondsSpent) return ZERO_TIME_SPENT;

  const hours = `${Math.floor(secondsSpent / 3600)}`.padStart(2, '0');
  const minutes = `${Math.floor((secondsSpent % 3600) / 60)}`.padStart(2, '0');
  const seconds = `${secondsSpent % 60}`.padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const StudentLessonProgressDetailsWidget: React.FC<
  StudentLessonProgressDetailsWidgetProps
> = ({selectedUnitId, selectedLessonId, selectedStudentId}) => {
  const unitDataByUnit = useAppSelector(
    state => state.sectionProgress?.unitDataByUnit
  );
  const lessonProgressByUnit = useAppSelector(
    state => state.sectionProgress?.studentLessonProgressByUnit
  );
  const studentLevelProgressByUnit = useAppSelector(
    state => state.sectionProgress?.studentLevelProgressByUnit
  );

  const userProgressBySelectedLesson = React.useMemo(() => {
    const progressByUser: UserProgressInLessonData = {};
    if (
      selectedLessonId &&
      lessonProgressByUnit &&
      lessonProgressByUnit[selectedUnitId]
    ) {
      Object.keys(lessonProgressByUnit[selectedUnitId]).forEach(
        (userId: string) => {
          const lessonProgressByUnitForUser =
            lessonProgressByUnit[selectedUnitId][+userId][selectedLessonId];
          progressByUser[+userId] = lessonProgressByUnitForUser
            ? {
                progress: Math.floor(
                  lessonProgressByUnitForUser['completedPercent']
                ),
                timeSpent: formatTimeSpent(
                  lessonProgressByUnitForUser['timeSpent']
                ),
              }
            : {
                progress: 0,
                timeSpent: ZERO_TIME_SPENT,
              };
        }
      );
    }
    return progressByUser;
  }, [selectedUnitId, selectedLessonId, lessonProgressByUnit]);

  // Map each lesson to the number of validated levels it has
  const lessonsToValidationLevels = React.useMemo(() => {
    const lessonsToValidationLevelsMap: {[lessonId: number]: string[]} = {};
    if (unitDataByUnit) {
      const lessons = unitDataByUnit[selectedUnitId]?.lessons;
      if (lessons) {
        Object.values(lessons).forEach(lesson => {
          const currLessonValidationLevels: string[] = [];
          Object.values(lesson.levels).forEach(level => {
            if (level.isValidated) {
              currLessonValidationLevels.push(level.id);
            }
          });
          lessonsToValidationLevelsMap[lesson.id] = currLessonValidationLevels;
        });
      }
    }
    return lessonsToValidationLevelsMap;
  }, [unitDataByUnit, selectedUnitId]);

  // Map each lesson to the amount of validation levels each student has completed
  const userValidationProgressByLesson = React.useMemo(() => {
    const userValidationProgressByLessonMap: UserValidationProgressByLessonData =
      {};
    if (lessonsToValidationLevels && studentLevelProgressByUnit) {
      Object.entries(lessonsToValidationLevels).forEach(
        ([lessonId, validationLevelIds]) => {
          const levelProgressByUser: {[userId: string]: number} = {};
          Object.entries(studentLevelProgressByUnit[selectedUnitId]).forEach(
            ([userId, levelProgress]) => {
              levelProgressByUser[userId] = Object.entries(
                levelProgress
              ).filter(
                ([levelId, progress]) =>
                  validationLevelIds.includes(levelId) &&
                  COMPLETED_STATUSES.includes(progress.status)
              ).length;
            }
          );
          userValidationProgressByLessonMap[lessonId] = levelProgressByUser;
        }
      );
      return userValidationProgressByLessonMap;
    }
  }, [selectedUnitId, lessonsToValidationLevels, studentLevelProgressByUnit]);

  const numValidationLevelsCompleteString = React.useMemo(() => {
    if (
      !selectedUnitId ||
      !selectedLessonId ||
      !selectedStudentId ||
      !lessonsToValidationLevels ||
      !userValidationProgressByLesson ||
      !userValidationProgressByLesson[selectedLessonId]
    ) {
      return '0 of 0 passed';
    }

    const numValidationLevelsUserCompleted =
      userValidationProgressByLesson[selectedLessonId][`${selectedStudentId}`];
    const totalValidationLevels = lessonsToValidationLevels[selectedLessonId];
    return numValidationLevelsUserCompleted === totalValidationLevels?.length
      ? COMPLETE_PERCENT_STRING
      : `${numValidationLevelsUserCompleted ?? 0} of ${
          totalValidationLevels?.length ?? 0
        } passed`;
  }, [
    selectedUnitId,
    selectedLessonId,
    selectedStudentId,
    lessonsToValidationLevels,
    userValidationProgressByLesson,
  ]);

  return (
    <WidgetTemplate widgetName="Lesson Details" gridWidth={3} gridHeight={1}>
      <div className={styles.lessonDetailsWidget}>
        <div className={styles.lessonDetail}>
          <FontAwesomeV6Icon iconName={'chart-line'} iconStyle={'regular'} />
          <div
            className={classNames(
              styles.lessonDetailLabelAndInfo,
              userProgressBySelectedLesson[selectedStudentId]?.progress ===
                100 && styles.greenCompletedText
            )}
          >
            <Typography variant="overline3">Progress</Typography>
            <Typography variant="h4">{`${
              userProgressBySelectedLesson[selectedStudentId]?.progress ?? '0'
            }% complete`}</Typography>
          </div>
        </div>
        <div className={styles.lessonDetail}>
          <FontAwesomeV6Icon
            iconName={'clipboard-check'}
            iconStyle={'regular'}
          />
          <div
            className={classNames(
              styles.lessonDetailLabelAndInfo,
              numValidationLevelsCompleteString === COMPLETE_PERCENT_STRING &&
                styles.greenCompletedText
            )}
          >
            <Typography variant="overline3">Validation tests</Typography>
            <Typography variant="h4">
              {numValidationLevelsCompleteString}
            </Typography>
          </div>
        </div>
        <div className={styles.lessonDetail}>
          <FontAwesomeV6Icon iconName={'clock'} iconStyle={'regular'} />
          <div className={styles.lessonDetailLabelAndInfo}>
            <Typography variant="overline3">Time spent</Typography>
            <Typography variant="h4">
              {userProgressBySelectedLesson[selectedStudentId]?.timeSpent ??
                ZERO_TIME_SPENT}
            </Typography>
          </div>
        </div>
      </div>
    </WidgetTemplate>
  );
};

export default StudentLessonProgressDetailsWidget;
