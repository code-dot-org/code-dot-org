import Alert from '@code-dot-org/component-library/alert';
import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useSearchParams} from 'react-router-dom';

import DCDO from '@cdo/apps/dcdo';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgressV2/sectionProgressLoader';
import {
  isLearnToEvaluateTourOnSnapshotPage,
  resumeLearnHowToEvaluateTour,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useLearnHowToEvaluateTour';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const canParseUrl = (urlString: string | object | boolean): boolean => {
  if (urlString && typeof urlString === 'string') {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

import {getFullName} from '../manageStudents/utils';

import ExemplarCodeWidget from './codeWidget/ExemplarCodeWidget';
import StudentCodeWidget from './codeWidget/StudentCodeWidget';
import Header from './header';
import LessonFeedbackWidget from './lessonFeedbackWidget/LessonFeedbackWidget';
import LessonInsightWidget from './lessonInsightWidget';
import StudentCFUWidget from './studentCFUWidget';
import StudentLessonProgressDetailsWidget from './studentLessonProgressDetailsWidget';
import StudentRubricWidget from './studentRubricWidget/StudentRubricWidget';

import styles from './studentSnapshot.module.scss';

interface LessonsData {
  lessons: LessonOption[];
  hasUnnumberedLessons: boolean;
}

const getLessons = (unitId: number) =>
  HttpClient.fetchJson<LessonsData>(
    `/student_snapshots/lessons/${unitId}`
  ).then(response => response?.value);

const lessonsCachedLoader = _.memoize(getLessons);

const parseIdParam = (idParam: string | null): number | null => {
  const parsed = idParam ? Number(idParam) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const StudentSnapshot: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedStudentId, setSelectedStudentId] = React.useState<
    number | null
  >(() => parseIdParam(searchParams.get('studentId')));
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(() =>
    parseIdParam(searchParams.get('lessonId'))
  );
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);

  const sectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );
  const sectionCourseId = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .courseId
      : null
  );
  const sectionDemoType = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          ?.demoType ?? null
      : null
  );
  const selectedUnitId = useSelector(getSelectedUnitId);
  const selectedUnitPosition = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .unitPosition
      : null
  );
  const {selectedStudents, demoPresets} = useAppSelector(
    state => state.teacherSections
  );

  const aiTaEnabled = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );

  const selectedStudent = React.useMemo(
    () => selectedStudents.find(student => student.id === selectedStudentId),
    [selectedStudentId, selectedStudents]
  );

  const selectedLesson = React.useMemo(
    () => lessons.find(lesson => lesson.id === selectedLessonId),
    [lessons, selectedLessonId]
  );

  const feedbackLink = DCDO.get('student-snapshot-feedback-link', undefined);

  const tourResumed = useRef(false);

  useEffect(() => {
    analyticsReporter.sendEvent(EVENTS.STUDENT_SNAPSHOT_VIEWED);
    if (tourResumed.current) return;
    tourResumed.current = true;
    resumeLearnHowToEvaluateTour();
  }, []);

  useEffect(() => {
    setSearchParams(
      prevParams => {
        const nextParams = new URLSearchParams(prevParams);
        if (selectedLessonId !== null) {
          nextParams.set('lessonId', String(selectedLessonId));
        } else {
          nextParams.delete('lessonId');
        }
        if (selectedStudentId !== null) {
          nextParams.set('studentId', String(selectedStudentId));
        } else {
          nextParams.delete('studentId');
        }
        return nextParams;
      },
      {replace: true}
    );
  }, [selectedLessonId, selectedStudentId, setSearchParams]);

  useEffect(() => {
    if (selectedUnitId) {
      setIsLessonsLoading(true);
      lessonsCachedLoader(selectedUnitId)
        .then(lessonsData => {
          setLessons(lessonsData.lessons);
          setHasUnnumberedLessons(lessonsData.hasUnnumberedLessons);
          // When the Learn How to Evaluate tour has directed the user to this
          // page, pre-select the lesson that the tour is focused on (which may not be the first lesson in the unit, depending on the section's demo type).
          if (isLearnToEvaluateTourOnSnapshotPage()) {
            const lessonList = lessonsData.lessons;
            const defaultTourLesson = sectionDemoType
              ? demoPresets[sectionDemoType]
                  ?.studentSnapshotDefaultTourLesson ?? null
              : null;
            const targetLesson =
              (defaultTourLesson !== null
                ? lessonList.find(l => l.position === defaultTourLesson)
                : null) ??
              lessonList[lessonList.length - 1] ??
              null;
            if (targetLesson) setSelectedLessonId(targetLesson.id);
          }
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
  }, [
    sectionId,
    selectedUnitId,
    sectionCourseId,
    selectedUnitPosition,
    sectionDemoType,
    demoPresets,
  ]);

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

      {canParseUrl(feedbackLink) && (
        <Alert
          type={'primary'}
          size={'s'}
          text={
            "We'd love your feedback on the new Student Snapshot page. Just a few minutes will help us improve!"
          }
          link={{
            text: 'Feedback form',
            href: String(feedbackLink),
            openInNewTab: true,
          }}
          icon={{iconName: 'comment-dots', iconStyle: 'regular'}}
        />
      )}

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
        <StudentLessonProgressDetailsWidget
          selectedUnitId={selectedUnitId}
          selectedLessonId={selectedLessonId}
          selectedStudentId={selectedStudentId}
        />
        <LessonInsightWidget
          selectedUnitId={selectedUnitId}
          selectedLessonId={selectedLessonId}
          selectedStudentId={selectedStudentId}
        />
        <LessonFeedbackWidget
          lessonId={selectedLessonId}
          teacherHasEnabledAi={aiTaEnabled}
          studentId={selectedStudentId}
          unitId={selectedUnitId}
          sectionId={sectionId}
        />
        <StudentCFUWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={selectedStudentId}
        />
        <StudentCodeWidget
          selectedUnitId={selectedUnitId}
          selectedLessonId={selectedLessonId}
          selectedStudentId={selectedStudentId}
          hasCodeLevel={!!selectedLesson?.hasCodeLevel}
        />
        <StudentRubricWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={selectedStudentId}
          studentName={selectedStudent ? getFullName(selectedStudent) : ''}
          teacherHasEnabledAi={false}
          canProvideFeedback={true}
        />
        <ExemplarCodeWidget lessonId={selectedLessonId} />
      </div>
    </div>
  );
};

export default StudentSnapshot;
