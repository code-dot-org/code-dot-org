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

interface UserProgressByLessonData {
  [lessonId: string]: {
    [userId: number]: {
      progress: number | null;
      timeSpent: string | null;
    };
  };
}

interface ProgressAveragesByLessonData {
  [lessonId: string]: {
    progressAverage: number;
    timeSpentAverage: string;
  };
}

interface UserValidationProgressByLessonData {
  [lessonId: string]: {
    [userId: string]: number;
  };
}

interface ClassAvgValidationProgressByLessonData {
  [lessonId: string]: number;
}

const COMPLETED_STATUSES: string[] = [
  LevelStatus.completed_assessment,
  LevelStatus.free_play_complete,
  LevelStatus.passed,
  LevelStatus.perfect,
  LevelStatus.review_accepted,
  LevelStatus.submitted,
];

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
  const studentIds = useAppSelector(state =>
    state.teacherSections?.selectedStudents?.map(student => student.id)
  );

  // Map each lesson to both individual student progress + time spent in the given lesson and
  // the class's averages of both
  const {userProgressByLesson, progressAveragesByLesson} = React.useMemo(() => {
    const progressByUser: UserProgressByLessonData = {};
    const progressAverages: ProgressAveragesByLessonData = {};
    if (
      unitDataByUnit &&
      studentIds &&
      studentIds.length > 0 &&
      lessonProgressByUnit &&
      lessonProgressByUnit[selectedUnitId]
    ) {
      const lessons = unitDataByUnit[selectedUnitId]?.lessons;
      if (lessons) {
        // Iterate through lessons in this unit
        Object.values(lessons).forEach(lesson => {
          progressByUser[lesson.id] = {};
          let currLessonProgressTotal = 0;
          let currLessonTimeSpentTotal = 0;

          // Iterate through students in this section
          studentIds.forEach(userId => {
            const unitProgressForUser =
              lessonProgressByUnit[selectedUnitId][userId];
            const lessonProgressForUser = unitProgressForUser
              ? unitProgressForUser[lesson.id]
              : null;

            // Only bother adding stats to averages if user has made progress in this lesson
            if (lessonProgressForUser) {
              progressByUser[lesson.id][userId] = {
                progress: Math.floor(lessonProgressForUser['completedPercent']),
                timeSpent: formatTimeSpent(lessonProgressForUser['timeSpent']),
              };
              currLessonProgressTotal +=
                lessonProgressForUser['completedPercent'];
              currLessonTimeSpentTotal += lessonProgressForUser['timeSpent'];
            } else {
              progressByUser[lesson.id][userId] = {
                progress: 0,
                timeSpent: ZERO_TIME_SPENT,
              };
            }
          });

          // Store averages for the lesson
          progressAverages[lesson.id] = {
            progressAverage: Math.floor(
              currLessonProgressTotal / studentIds.length
            ),
            timeSpentAverage: formatTimeSpent(
              Math.floor(currLessonTimeSpentTotal / studentIds.length)
            ),
          };
        });
      }
    }

    return {
      userProgressByLesson: progressByUser,
      progressAveragesByLesson: progressAverages,
    };
  }, [unitDataByUnit, lessonProgressByUnit, studentIds, selectedUnitId]);

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

  // Map each lesson to both the amount of validation levels each student has completed and
  // the class average of it
  const {userValidationProgressByLesson, classAvgValidationProgressByLesson} =
    React.useMemo(() => {
      const userValidationProgressByLessonMap: UserValidationProgressByLessonData =
        {};
      const classAvgValidationProgressByLessonMap: ClassAvgValidationProgressByLessonData =
        {};

      if (lessonsToValidationLevels && studentLevelProgressByUnit) {
        Object.entries(lessonsToValidationLevels).forEach(
          ([lessonId, validationLevelIds]) => {
            const levelProgressByUser: {[userId: string]: number} = {};
            let classValidationProgressTotal = 0;
            Object.entries(studentLevelProgressByUnit[selectedUnitId]).forEach(
              ([userId, levelProgress]) => {
                const numCompletedValidationLevels = Object.entries(
                  levelProgress
                ).filter(
                  ([levelId, progress]) =>
                    validationLevelIds.includes(levelId) &&
                    COMPLETED_STATUSES.includes(progress.status)
                ).length;
                levelProgressByUser[userId] = numCompletedValidationLevels;
                classValidationProgressTotal += numCompletedValidationLevels;
              }
            );
            userValidationProgressByLessonMap[lessonId] = levelProgressByUser;
            classAvgValidationProgressByLessonMap[lessonId] = Math.floor(
              classValidationProgressTotal / studentIds.length
            );
          }
        );
      }
      return {
        userValidationProgressByLesson: userValidationProgressByLessonMap,
        classAvgValidationProgressByLesson:
          classAvgValidationProgressByLessonMap,
      };
    }, [
      selectedUnitId,
      lessonsToValidationLevels,
      studentIds,
      studentLevelProgressByUnit,
    ]);

  const selectedStudentLessonProgressInfo = React.useMemo(() => {
    return userProgressByLesson[selectedLessonId]
      ? userProgressByLesson[selectedLessonId][selectedStudentId]
      : null;
  }, [userProgressByLesson, selectedLessonId, selectedStudentId]);

  const numValidationLevelsUserCompleted = React.useMemo(() => {
    return userValidationProgressByLesson[selectedLessonId]
      ? userValidationProgressByLesson[selectedLessonId][
          `${selectedStudentId}`
        ] ?? 0
      : 0;
  }, [userValidationProgressByLesson, selectedLessonId, selectedStudentId]);

  const numValidationLevelsCompleteString = (
    numValidationLevelsComplete: number
  ) => {
    if (!selectedLessonId || !lessonsToValidationLevels) {
      return '0 of 0 passed';
    }

    const totalValidationLevels =
      lessonsToValidationLevels[selectedLessonId]?.length ?? 0;
    return `${numValidationLevelsComplete} of ${totalValidationLevels} passed`;
  };

  const selectedStudentLessonProgress =
    selectedStudentLessonProgressInfo?.progress ?? 0;
  const selectedStudentLessonTimeSpent =
    selectedStudentLessonProgressInfo?.timeSpent ?? ZERO_TIME_SPENT;
  const classAvgLessonProgress =
    progressAveragesByLesson[selectedLessonId]?.progressAverage ?? 0;
  const classAvgNumValidationLevelsCompleted =
    classAvgValidationProgressByLesson[selectedLessonId] ?? 0;
  const classAvgLessonTimeSpent =
    progressAveragesByLesson[selectedLessonId]?.timeSpentAverage ??
    ZERO_TIME_SPENT;
  const numUnpassedValidationLevels =
    (lessonsToValidationLevels[selectedLessonId]?.length ?? 0) -
    numValidationLevelsUserCompleted;

  return (
    <WidgetTemplate widgetName="Lesson Details" gridWidth={3} gridHeight={1}>
      <div className={styles.lessonDetailsWidget}>
        <div
          className={classNames(styles.lessonDetailsWidgetRow, styles.topRow)}
        >
          <div className={styles.lessonDetail}>
            <FontAwesomeV6Icon iconName={'chart-line'} iconStyle={'regular'} />
            <div
              className={classNames(
                styles.lessonDetailLabelAndInfo,
                selectedStudentLessonProgress === 100 &&
                  styles.greenCompletedText
              )}
            >
              <Typography variant="overline3">Progress</Typography>
              <Typography variant="h4">{`${selectedStudentLessonProgress}% complete`}</Typography>
              <div
                className={classNames(
                  styles.classAvgInfo,
                  selectedStudentLessonProgress > classAvgLessonProgress
                    ? styles.aboveClassAvg
                    : styles.belowClassAvg
                )}
              >
                <Typography variant="body4">{`Class Avg: ${classAvgLessonProgress}%`}</Typography>
                {selectedStudentLessonProgress !== classAvgLessonProgress && (
                  <FontAwesomeV6Icon
                    iconName={
                      selectedStudentLessonProgress > classAvgLessonProgress
                        ? 'arrow-up'
                        : 'arrow-down'
                    }
                    iconStyle={'regular'}
                  />
                )}
              </div>
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
                numUnpassedValidationLevels === 0 && styles.greenCompletedText
              )}
            >
              <Typography variant="overline3">Validation tests</Typography>
              <Typography variant="h4">
                {numValidationLevelsCompleteString(
                  numValidationLevelsUserCompleted
                )}
              </Typography>
              <div
                className={classNames(
                  styles.classAvgInfo,
                  numValidationLevelsUserCompleted >
                    classAvgNumValidationLevelsCompleted
                    ? styles.aboveClassAvg
                    : styles.belowClassAvg
                )}
              >
                <Typography variant="body4">{`Class Avg: ${numValidationLevelsCompleteString(
                  classAvgNumValidationLevelsCompleted
                )}`}</Typography>
                {numValidationLevelsUserCompleted !==
                  classAvgNumValidationLevelsCompleted && (
                  <FontAwesomeV6Icon
                    iconName={
                      numValidationLevelsUserCompleted >
                      classAvgNumValidationLevelsCompleted
                        ? 'arrow-up'
                        : 'arrow-down'
                    }
                    iconStyle={'regular'}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={styles.lessonDetail}>
            <FontAwesomeV6Icon iconName={'clock'} iconStyle={'regular'} />
            <div className={styles.lessonDetailLabelAndInfo}>
              <Typography variant="overline3">Time spent</Typography>
              <Typography variant="h4">
                {selectedStudentLessonTimeSpent}
              </Typography>
              <div
                className={classNames(
                  styles.classAvgInfo,
                  selectedStudentLessonProgress < classAvgLessonProgress
                    ? styles.aboveClassAvg
                    : styles.belowClassAvg
                )}
              >
                <Typography variant="body4">{`Class Avg: ${classAvgLessonTimeSpent}`}</Typography>
                {selectedStudentLessonTimeSpent !== classAvgLessonTimeSpent && (
                  <FontAwesomeV6Icon
                    iconName={
                      selectedStudentLessonTimeSpent < classAvgLessonTimeSpent
                        ? 'arrow-up'
                        : 'arrow-down'
                    }
                    iconStyle={'regular'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={classNames(
            styles.lessonDetailsWidgetRow,
            styles.bottomRow
          )}
        >
          <div className={styles.lessonDetail}>
            <div className={styles.validationLevelFeedback}>
              {numUnpassedValidationLevels > 0 && (
                <div className={styles.validationLevelCount}>
                  <FontAwesomeV6Icon
                    iconName={'triangle-exclamation'}
                    iconStyle={'solid'}
                  />
                  <Typography variant="body3">{`${numUnpassedValidationLevels} ${
                    numUnpassedValidationLevels > 1 ? 'tests' : 'test'
                  } not passed`}</Typography>
                </div>
              )}
              <Typography variant="body4">
                {numUnpassedValidationLevels === 0
                  ? 'There were no failed tests in this lesson.'
                  : 'The app structure is correct, but key validation rules (e.g., form completion, value limits) were not implemented.'}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </WidgetTemplate>
  );
};

export default StudentLessonProgressDetailsWidget;
