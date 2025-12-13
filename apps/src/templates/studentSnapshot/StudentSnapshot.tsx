import {Typography} from '@mui/material';
import _ from 'lodash';
import React, {useState, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {getSelectedUnitId} from '@cdo/apps/redux/unitSelectionRedux';
import CodeWidget from '@cdo/apps/templates/studentSnapshot/CodeWidget';
import {LessonOption} from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getFullName} from '../manageStudents/utils';

import Header from './header';
import WidgetTemplate from './widgetTemplate';

import styles from './studentSnapshot.module.scss';

interface UnitLessonsResponse {
  lessons: LessonOption[];
  hasUnnumberedLessons: boolean;
}

interface PythonlabLevel {
  id: number;
  name: string;
  exemplarSources?: MultiFileSource;
}

interface LessonData {
  pythonlabLevel?: PythonlabLevel | null;
  cfuLevels?: Array<{id: number; name: string}>;
}

const getUnitLessons = (unitId: number) =>
  HttpClient.fetchJson<UnitLessonsResponse>(
    `/student_snapshots/units/${unitId}/lessons`
  ).then(response => response?.value);

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

const unitLessonsCachedLoader = _.memoize(getUnitLessons);

const StudentSnapshot: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [unitLessons, setUnitLessons] = useState<LessonOption[]>([]);
  const [isUnitLessonsLoading, setIsUnitLessonsLoading] =
    useState<boolean>(false);
  const [hasUnnumberedLessons, setHasUnnumberedLessons] =
    useState<boolean>(false);

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isLessonDataLoading, setIsLessonDataLoading] =
    useState<boolean>(false);

  const {selectedStudents} = useAppSelector(state => state.teacherSections);

  const selectedStudent = useMemo(
    () => selectedStudents.find(student => student.id === selectedStudentId),
    [selectedStudentId, selectedStudents]
  );

  const selectedUnitId = useSelector(getSelectedUnitId);

  const exemplarCode = lessonData?.pythonlabLevel?.exemplarSources;

  useEffect(() => {
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
    }
  }, [selectedUnitId]);

  useEffect(() => {
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
        <WidgetTemplate widgetName="Long Widget" gridWidth={3} gridHeight={1}>
          <div>content</div>
        </WidgetTemplate>
        <CodeWidget
          codeData={exemplarCode}
          widgetName="Exemplar Code"
          gridWidth={1}
          loading={isLessonDataLoading}
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
      </div>
    </div>
  );
};

export default StudentSnapshot;
