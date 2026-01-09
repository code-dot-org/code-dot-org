import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import CodeWidget from '@cdo/apps/templates/studentSnapshot/CodeWidget';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getFullName} from '../manageStudents/utils';

import Header from './header';
import StudentLessonProgressDetailsWidget from './studentLessonProgressDetailsWidget';
import StudentRubricWidget from './studentRubricWidget/StudentRubricWidget';
import WidgetTemplate from './widgetTemplate';

import styles from './studentSnapshot.module.scss';

interface UnitLessonsResponse {
  lessons: LessonOption[];
  hasUnnumberedLessons: boolean;
}

const getUnitLessons = (unitId: number) =>
  HttpClient.fetchJson<UnitLessonsResponse>(
    `/student_snapshots/units/${unitId}/lessons`
  ).then(response => response?.value);

const unitLessonsCachedLoader = _.memoize(getUnitLessons);

interface CFULevel {
  id: number;
  name: string;
  display_name: string;
  type: string;
  key?: string;
  script_level_id: number;
  progression?: string;
  progression_display_name?: string;
}

interface CFULevelsData {
  cfu_levels: CFULevel[];
}

const getCFULevels = (lessonId: number): Promise<CFULevel[]> => {
  return HttpClient.fetchJson<CFULevelsData>(
    `/student_snapshots/cfu_levels/${lessonId}`
  ).then(response => response?.value?.cfu_levels || []);
};

interface PythonlabLevel {
  id: number;
  name: string;
  exemplarSources?: MultiFileSource;
}

interface LessonData {
  pythonlabLevel?: PythonlabLevel | null;
  cfuLevels?: Array<{id: number; name: string}>;
}

const getLessonData = (lessonId: number, includeParams: string[]) => {
  const params = new URLSearchParams();
  if (includeParams.includes('pythonlab')) {
    params.append('include_pythonlab', 'true');
  }
  if (includeParams.includes('cfu')) {
    params.append('include_cfu', 'true');
  }

  return HttpClient.fetchJson<LessonData>(
    `/student_snapshots/lessons/${lessonId}/data?${params}`
  ).then(response => response?.value);
};

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
  const [unitLessons, setUnitLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [isUnitLessonsLoading, setIsUnitLessonsLoading] =
    useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);
  const [cfuLevels, setCfuLevels] = useState<CFULevel[]>([]);
  const [isCfuLevelsLoading, setIsCfuLevelsLoading] = useState<boolean>(false);
  const [studentCode, setStudentCode] = useState<Record<string, string>>({});
  const [isStudentCodeLoading, setIsStudentCodeLoading] =
    useState<boolean>(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isLessonDataLoading, setIsLessonDataLoading] =
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
  const selectedUnitId = useSelector(getSelectedUnitId);
  const selectedUnitPosition = useAppSelector(state =>
    state.teacherSections.selectedSectionId
      ? state.teacherSections.sections[state.teacherSections.selectedSectionId]
          .unitPosition
      : null
  );
  const {selectedStudents} = useAppSelector(state => state.teacherSections);
  const selectedStudent = React.useMemo(
    () => selectedStudents.find(student => student.id === selectedStudentId),
    [selectedStudentId, selectedStudents]
  );

  const exemplarCode = lessonData?.pythonlabLevel?.exemplarSources;

  React.useEffect(() => {
    if (selectedUnitId) {
      setIsUnitLessonsLoading(true);
      unitLessonsCachedLoader(selectedUnitId)
        .then(response => {
          setUnitLessons(response.lessons);
          setHasUnnumberedLessons(response.hasUnnumberedLessons);
        })
        .finally(() => {
          setIsUnitLessonsLoading(false);
        });
      loadUnitProgress(
        selectedUnitId,
        sectionId,
        sectionCourseId,
        selectedUnitPosition
      );
    }
  }, [sectionId, selectedUnitId, sectionCourseId, selectedUnitPosition]);

  // fetch last PythonLab exemplar code
  React.useEffect(() => {
    if (selectedLessonId) {
      setIsLessonDataLoading(true);
      // Specify which widgets/data you need
      getLessonData(selectedLessonId, ['pythonlab'])
        .then(data => {
          setLessonData(data);
        })
        .finally(() => {
          setIsLessonDataLoading(false);
        });
    } else {
      setLessonData(null);
    }
  }, [selectedLessonId]);

  // Fetch CFU levels when lesson changes
  React.useEffect(() => {
    if (selectedLessonId) {
      setIsCfuLevelsLoading(true);
      getCFULevels(selectedLessonId)
        .then(levels => {
          setCfuLevels(levels);
        })
        .catch(error => {
          console.error('Error fetching CFU levels:', error);
          setCfuLevels([]);
        })
        .finally(() => {
          setIsCfuLevelsLoading(false);
        });
    } else {
      setCfuLevels([]);
    }
  }, [selectedLessonId]);

  // TODO: Use this in CFU widget
  console.log(cfuLevels, isCfuLevelsLoading);

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

  // TODO: replace with actual values from URL/Redux later
  const HARDCODED_STUDENT_ID = 8; // Replace with actual student ID
  const HARDCODED_STUDENT_NAME = 'Student Name'; // Replace with actual student name

  return (
    <div className={styles.snapshotContainer}>
      <Header
        lessons={unitLessons}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
        isLessonsLoading={isUnitLessonsLoading}
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
        <CodeWidget
          codeData={exemplarCode}
          widgetName="Exemplar Code"
          gridWidth={1}
          loading={isLessonDataLoading}
        />
        <CodeWidget
          codeData={studentCode}
          widgetName="Student Code"
          gridWidth={1}
          loading={isStudentCodeLoading}
        />
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
