import React, {useMemo, useState, useEffect} from 'react';

import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import CodeWidget from './';

interface StudentCodeWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  selectedUnitId: number;
  selectedLessonId: number | null;
  selectedStudentId: number | null;
}

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

const StudentCodeWidget = ({
  gridWidth = 1,
  gridHeight = 2,
  selectedUnitId,
  selectedLessonId,
  selectedStudentId,
}: StudentCodeWidgetProps) => {
  const [studentCode, setStudentCode] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (selectedUnitId && selectedLessonId && selectedStudentId) {
      setIsLoading(true);
      getStudentCode(selectedUnitId, selectedLessonId, selectedStudentId)
        .then(code => {
          setStudentCode(code);
        })
        .catch(error => {
          console.error('Error fetching student code:', error);
          setStudentCode({});
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setStudentCode({});
    }
  }, [selectedUnitId, selectedLessonId, selectedStudentId]);

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

  return (
    <CodeWidget
      codeData={codeData}
      widgetName="Student Code"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={isLoading}
    />
  );
};

export default StudentCodeWidget;
