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
  // Whether the lesson has a level that could produce student code. Hide the
  // widget only when this is false, not merely because the student hasn't
  // written any code yet.
  hasCodeLevel: boolean;
}

interface StudentCodeData {
  studentCode: Record<string, string>;
  studentCodeUrls?: Record<string, string>;
}

const getStudentCode = (
  unitId: number,
  lessonId: number,
  studentId: number
): Promise<StudentCodeData> => {
  return HttpClient.fetchJson<StudentCodeData>(
    `/student_snapshots/units/${unitId}/lessons/${lessonId}/students/${studentId}/code`
  ).then(
    response =>
      response?.value || {
        studentCode: {},
        studentCodeUrls: {},
      }
  );
};

const StudentCodeWidget = ({
  gridWidth = 1,
  gridHeight = 2,
  selectedUnitId,
  selectedLessonId,
  selectedStudentId,
  hasCodeLevel,
}: StudentCodeWidgetProps) => {
  const [studentCode, setStudentCode] = useState<StudentCodeData>({
    studentCode: {},
    studentCodeUrls: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    if (selectedUnitId && selectedLessonId && selectedStudentId) {
      setIsLoading(true);
      getStudentCode(selectedUnitId, selectedLessonId, selectedStudentId)
        .then(code => {
          setStudentCode(code);
        })
        .catch(error => {
          console.error('Error fetching student code:', error);
          setStudentCode({studentCode: {}, studentCodeUrls: {}});
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setStudentCode({studentCode: {}, studentCodeUrls: {}});
    }
  }, [selectedUnitId, selectedLessonId, selectedStudentId]);

  const codeData = useMemo<MultiFileSource | undefined>(() => {
    const {studentCode: codeFiles, studentCodeUrls: urls} = studentCode;
    if (!codeFiles || Object.keys(codeFiles).length === 0) {
      return undefined;
    }

    const files: Record<string, ProjectFile> = {};
    const fileIds: string[] = [];

    Object.entries(codeFiles).forEach(([filename, contents], index) => {
      const fileId = `file_${index}`;
      files[fileId] = {
        id: fileId,
        name: filename,
        contents: contents,
        url: urls?.[filename],
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
    />
  );
};

export default StudentCodeWidget;
