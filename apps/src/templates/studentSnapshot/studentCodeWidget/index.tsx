import {ProjectFile} from '@codebridge/types';
import React, {useState, useMemo} from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';

import CodeDisplay from './CodeDisplay';

interface StudentCodeWidgetProps {
  studentCode?: Record<string, string>;
  gridWidth?: number;
  gridHeight?: number;
}

const StudentCodeWidget: React.FC<StudentCodeWidgetProps> = ({
  studentCode = {},
  gridWidth = 2,
  gridHeight = 2,
}) => {
  // Convert student code to ProjectFile objects
  const projectFiles = useMemo<ProjectFile[]>(() => {
    if (!studentCode || typeof studentCode !== 'object') {
      return [];
    }
    return Object.entries(studentCode).map(([fileName, contents]) => ({
      id: fileName,
      name: fileName,
      language: '',
      contents: contents,
      folderId: '',
    }));
  }, [studentCode]);

  const [selectedFileId, setSelectedFileId] = useState<string>('');

  // Set initial file when files become available
  React.useEffect(() => {
    if (projectFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(projectFiles[0].id);
    }
  }, [projectFiles, selectedFileId]);

  return (
    <WidgetTemplate
      widgetName="Student Code"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      scrollable={true}
    >
      <CodeDisplay
        files={projectFiles}
        selectedFileId={selectedFileId}
        onFileSelect={setSelectedFileId}
      />
    </WidgetTemplate>
  );
};

export default StudentCodeWidget;
