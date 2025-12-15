import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import _ from 'lodash';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getFullName} from '../manageStudents/utils';

import Header from './header';
import StudentRubricWidget from './studentRubricWidget/StudentRubricWidget';
import WidgetTemplate from './widgetTemplate';

import styles from './studentSnapshot.module.scss';

interface LessonsData {
  lessons: LessonOption[];
  hasUnnumberedLessons: boolean;
}

interface UserProgressInLessonData {
  [userId: number]: {
    progress: number | null;
    timeSpent: string | null;
  };
}

const getLessons = (unitId: number) =>
  HttpClient.fetchJson<LessonsData>(
    `/student_snapshots/lessons/${unitId}`
  ).then(response => response?.value);

const lessonsCachedLoader = _.memoize(getLessons);

const ZERO_TIME_SPENT = '00:00:00';

const formatTimeSpent = (secondsSpent: number) => {
  if (!secondsSpent) return ZERO_TIME_SPENT;

  const hours = `${Math.floor(secondsSpent / 3600)}`.padStart(2, '0');
  const minutes = `${Math.floor((secondsSpent % 3600) / 60)}`.padStart(2, '0');
  const seconds = `${secondsSpent % 60}`.padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const StudentSnapshot: React.FC = () => {
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    number | null
  >(null);

  const sectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );
  const sectionCourseId = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .courseId
      : null
  );
  const selectedUnitId = useSelector(getSelectedUnitId);
  const selectedUnitPosition = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .unitPosition
      : null
  );
  const lessonProgressByUnit = useAppSelector(
    state => state.sectionProgress?.studentLessonProgressByUnit
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

  const {selectedStudents} = useAppSelector(state => state.teacherSections);
  const selectedStudent = React.useMemo(
    () => selectedStudents.find(student => student.id === selectedStudentId),
    [selectedStudentId, selectedStudents]
  );

  React.useEffect(() => {
    if (selectedUnitId) {
      setIsLessonsLoading(true);
      lessonsCachedLoader(selectedUnitId)
        .then(lessonsData => {
          setLessons(lessonsData.lessons);
          setHasUnnumberedLessons(lessonsData.hasUnnumberedLessons);
        })
        .finally(() => {
          setIsLessonsLoading(false);
        });
      loadUnitProgress(
        selectedUnitId,
        sectionId,
        sectionCourseId,
        selectedUnitPosition
      );
    }
  }, [sectionId, selectedUnitId, sectionCourseId, selectedUnitPosition]);

  // TODO: replace with actual values from URL/Redux later
  const HARDCODED_STUDENT_ID = 8; // Replace with actual student ID
  const HARDCODED_STUDENT_NAME = 'Student Name'; // Replace with actual student name

  return (
    <div className={styles.snapshotContainer}>
      <Header
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
        isLessonsLoading={isLessonsLoading}
        selectedStudent={selectedStudent}
        setSelectedStudentId={setSelectedStudentId}
        hasUnnumberedLessons={hasUnnumberedLessons}
      />

      {selectedStudent && (
        <Typography
          variant="h4"
          className={styles.studentNameHeader}
          gutterBottom
        >
          {selectedStudent ? getFullName(selectedStudent) : 'Unknown student'}
        </Typography>
      )}

      <div className={styles.widgetGrid}>
        <StudentRubricWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={HARDCODED_STUDENT_ID}
          studentName={HARDCODED_STUDENT_NAME}
          teacherHasEnabledAi={false}
          canProvideFeedback={true}
        />
        <WidgetTemplate widgetName="Long Widget" gridWidth={3} gridHeight={1}>
          <div>content</div>
        </WidgetTemplate>
        <WidgetTemplate widgetName="Big Widget" gridWidth={2} gridHeight={2}>
          <div>big content</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 1"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 1</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 2"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 2</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Small Widget 3"
          gridWidth={1}
          gridHeight={1}
        >
          <div>small content 3</div>
        </WidgetTemplate>
        <WidgetTemplate
          widgetName="Loading widget"
          gridWidth={1}
          gridHeight={1}
          loading={true}
        >
          <div>Should not be displayed</div>
        </WidgetTemplate>
        {selectedStudentId && (
          <WidgetTemplate
            widgetName="Lesson Details"
            gridWidth={3}
            gridHeight={1}
          >
            <div className={styles.lessonDetailsWidget}>
              <div className={styles.lessonDetail}>
                <FontAwesomeV6Icon
                  iconName={'chart-line'}
                  iconStyle={'regular'}
                />
                <div
                  className={classNames(
                    styles.lessonDetailLabelAndInfo,
                    userProgressBySelectedLesson[selectedStudentId]
                      ?.progress === 100 && styles.greenCompletedText
                  )}
                >
                  <Typography variant="overline3">Progress</Typography>
                  <Typography variant="h4">{`${
                    userProgressBySelectedLesson[selectedStudentId]?.progress ??
                    '0'
                  }% complete`}</Typography>
                </div>
              </div>
              <div className={styles.lessonDetail}>
                <FontAwesomeV6Icon
                  iconName={'clipboard-check'}
                  iconStyle={'regular'}
                />
                <div className={styles.lessonDetailLabelAndInfo}>
                  <Typography variant="overline3">Validation tests</Typography>
                  <Typography variant="h4">9 of 12 passed</Typography>
                </div>
              </div>
              <div className={styles.lessonDetail}>
                <FontAwesomeV6Icon iconName={'clock'} iconStyle={'regular'} />
                <div className={styles.lessonDetailLabelAndInfo}>
                  <Typography variant="overline3">Time spent</Typography>
                  <Typography variant="h4">
                    {userProgressBySelectedLesson[selectedStudentId]
                      ?.timeSpent ?? ZERO_TIME_SPENT}
                  </Typography>
                </div>
              </div>
            </div>
          </WidgetTemplate>
        )}
      </div>
    </div>
  );
};

export default StudentSnapshot;
