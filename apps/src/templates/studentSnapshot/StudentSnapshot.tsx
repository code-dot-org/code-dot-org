import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const [initialFeedback, setInitialFeedback] = useState<string>('');

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

  async function getAiLessonFeedback(
    lessonId: number,
    unitId: number,
    studentId: number
  ) {
    try {
      const response = await fetch(
        `/student_snapshots/ai_generated_lesson_feedback?lesson_id=${lessonId}&unit_id=${unitId}&student_id=${studentId}`
      );
      if (!response.ok) {
        console.error(
          'Failed to fetch AI lesson feedback:',
          response.status,
          response.statusText
        );
        return null;
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Network or parsing error:', err);
      return null;
    }
  }

  // Fetch lesson feedback from backend, and if not found, try AI feedback
  useEffect(() => {
    async function fetchLessonFeedback() {
      if (!selectedLessonId || !selectedStudentId || !selectedUnitId) {
        setInitialFeedback('');
        return;
      }
      setInitialFeedback(''); // Clear feedback before fetching
      try {
        const response = await fetch(
          `/lesson_feedbacks/saved_feedback?lesson_id=${selectedLessonId}&student_id=${selectedStudentId}`
        );

        if (!response.ok) {
          // Try getting AI feedback from student work.
          // TODO: Modify this so we only try this if students have completed work in the lesson (or catch empty lesson state eariler)
          const aiData = await getAiLessonFeedback(
            selectedLessonId,
            selectedUnitId,
            selectedStudentId
          );
          const aiGeneratedInitialFeedback = JSON.parse(aiData.json).feedback;
          if (aiData) {
            setInitialFeedback(aiGeneratedInitialFeedback);
          }
        } else {
          const data = await response.json();
          if (data.saved_feedback) {
            setInitialFeedback(data.saved_feedback);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    }
    fetchLessonFeedback();
  }, [selectedLessonId, selectedStudentId, selectedUnitId]);

  useEffect(() => {
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
  useEffect(() => {
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

  // TODO(lfm): figure out what this is supposed to do
  console.log(isStudentCodeLoading);

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
        {selectedLessonId && selectedStudentId && (
          <StudentLessonProgressDetailsWidget
            selectedUnitId={selectedUnitId}
            selectedLessonId={selectedLessonId}
            selectedStudentId={selectedStudentId}
          />
        )}
        <LessonInsightWidget
          selectedUnitId={selectedUnitId}
          selectedLessonId={selectedLessonId}
          selectedStudentId={selectedStudentId}
        />
        <LessonFeedbackWidget
          lessonId={selectedLessonId}
          teacherHasEnabledAi={aiTaEnabled}
          initialFeedback={initialFeedback}
        />
        <StudentCFUWidget
          gridWidth={2}
          gridHeight={2}
          lessonId={selectedLessonId}
          studentId={selectedStudentId}
        />
        <StudentCodeWidget studentCode={studentCode} />
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
