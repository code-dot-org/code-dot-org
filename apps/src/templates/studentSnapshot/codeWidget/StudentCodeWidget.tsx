import React, {useMemo} from 'react';

import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

import CodeWidget from './';

interface StudentCodeWidgetProps {
  studentCode?: Record<string, string>;
  loading?: boolean;
}

const StudentCodeWidget = ({
  studentCode = {},
  loading,
}: StudentCodeWidgetProps) => {
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
        language: '',
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
      gridWidth={2}
      gridHeight={2}
      loading={loading}
    />
  );
};

export default StudentCodeWidget;
