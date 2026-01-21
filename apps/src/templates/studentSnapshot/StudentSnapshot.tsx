import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getFullName} from '../manageStudents/utils';

import StudentCodeWidget from './codeWidget/StudentCodeWidget';
import Header from './header';
import LessonFeedbackWidget from './lessonFeedbackWidget/LessonFeedbackWidget';
import StudentCFUWidget from './studentCFUWidget';
import StudentLessonProgressDetailsWidget from './studentLessonProgressDetailsWidget';
import StudentRubricWidget from './studentRubricWidget/StudentRubricWidget';
import WidgetTemplate from './widgetTemplate';

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

interface StudentCodeData {
  studentCode: Record<string, string>;
}

const getStudentCode = (
  unitId: number,
  lessonId: number,
  studentId: number
): Promise<Record<string, string>> => {
  return HttpClient.fetchJson<StudentCodeData>(
    `/student_snapshots/units/${unitId}/lessons/${lessonId}/students/${studentId}/code`
  ).then(response => response?.value?.studentCode || {});
};

const StudentSnapshot: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    number | null
  >(null);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);
  const [isStudentCodeLoading, setIsStudentCodeLoading] =
    useState<boolean>(false);
  const [studentCode, setStudentCode] = useState<Record<string, string>>({});

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
  const {selectedStudents} = useAppSelector(state => state.teacherSections);

  const aiTaEnabled = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );

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

  // Fetch Student Code when student or lesson changes
  React.useEffect(() => {
    if (selectedUnitId && selectedLessonId && selectedStudentId) {
      setIsStudentCodeLoading(true);
      getStudentCode(selectedUnitId, selectedLessonId, selectedStudentId)
        .then(code => {
          setStudentCode(code);
        })
        .catch(error => {
          console.error('Error fetching student code:', error);
          setStudentCode({});
        })
        .finally(() => {
          setIsStudentCodeLoading(false);
        });
    } else {
      setStudentCode({});
    }
  }, [selectedUnitId, selectedLessonId, selectedStudentId]);

  console.log(isStudentCodeLoading);

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
        <LessonFeedbackWidget
          lessonId={selectedLessonId}
          studentId={HARDCODED_STUDENT_ID}
          teacherHasEnabledAi={aiTaEnabled}
        />
        <StudentRubricWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={HARDCODED_STUDENT_ID}
          studentName={HARDCODED_STUDENT_NAME}
          teacherHasEnabledAi={false}
          canProvideFeedback={true}
        />
        <StudentCFUWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={selectedStudentId}
        />
        <WidgetTemplate widgetName="Long Widget" gridWidth={3} gridHeight={1}>
          <div>content</div>
        </WidgetTemplate>
        <StudentCodeWidget studentCode={studentCode} />
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
        {selectedLessonId && selectedStudentId && (
          <StudentLessonProgressDetailsWidget
            selectedUnitId={selectedUnitId}
            selectedLessonId={selectedLessonId}
            selectedStudentId={selectedStudentId}
          />
        )}
      </div>
    </div>
  );
};

export default StudentSnapshot;
