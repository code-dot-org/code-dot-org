import React, {useMemo, useState, useEffect} from 'react';

import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import {CodeWidgetLevelInfo} from './types';

import CodeWidget from './';

interface StudentCodeWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  selectedUnitId: number;
  selectedLessonId: number | null;
  selectedStudentId: number | null;
  // Whether the lesson has a level that could produce student code. Hide the
  // widget only when this is false, not merely because the student hasn't
  // written any code yet.
  hasCodeLevel: boolean;
}

interface StudentCodeData {
  studentCode: Record<string, string>;
  instructions?: string;
}

const getStudentCode = (
  unitId: number,
  lessonId: number,
  studentId: number
): Promise<StudentCodeData> => {
  return HttpClient.fetchJson<StudentCodeData>(
    `/student_snapshots/units/${unitId}/lessons/${lessonId}/students/${studentId}/code`
  ).then(response => response?.value || {studentCode: {}});
};

const StudentCodeWidget = ({
  gridWidth = 1,
  gridHeight = 2,
  selectedUnitId,
  selectedLessonId,
  selectedStudentId,
  hasCodeLevel,
}: StudentCodeWidgetProps) => {
  const [studentCodeData, setStudentCodeData] = useState<StudentCodeData>({
    studentCode: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    if (selectedUnitId && selectedLessonId && selectedStudentId) {
      let isCancelled = false;
      setIsLoading(true);
      getStudentCode(selectedUnitId, selectedLessonId, selectedStudentId)
        .then(data => {
          if (!isCancelled) {
            setStudentCodeData(data);
          }
        })
        .catch(error => {
          if (!isCancelled) {
            console.error('Error fetching student code:', error);
            setStudentCodeData({studentCode: {}});
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setStudentCodeData({studentCode: {}});
    }
  }, [selectedUnitId, selectedLessonId, selectedStudentId]);

  const studentCode = studentCodeData.studentCode;

  const levelInfo: CodeWidgetLevelInfo | undefined =
    studentCodeData.instructions
      ? {instructions: studentCodeData.instructions}
      : undefined;

  const codeData = useMemo<MultiFileSource | undefined>(() => {
    if (!studentCode || Object.keys(studentCode).length === 0) {
      return undefined;
    }

    const files: Record<string, ProjectFile> = {};
    const fileIds: string[] = [];

    Object.entries(studentCode).forEach(([filename, contents], index) => {
      const fileId = `file_${index}`;
      files[fileId] = {
        id: fileId,
        name: filename,
        contents: contents,
        folderId: 'root',
        active: index === 0, // Make first file active
      };
      fileIds.push(fileId);
    });

    const folders = {
      root: {
        id: 'root',
        name: 'root',
        parentId: '',
      },
    };

    return {
      folders: folders,
      files: files,
      openFiles: fileIds.slice(0, 1), // Open the first file by default
    } as MultiFileSource;
  }, [studentCode]);

  if (!hasCodeLevel && !isLoading) {
    return null;
  }

  return (
    <CodeWidget
      codeData={codeData}
      widgetName="Student Code"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={isLoading}
      levelInfo={levelInfo}
      emptyMessage="No student response"
    />
  );
};

export default StudentCodeWidget;
