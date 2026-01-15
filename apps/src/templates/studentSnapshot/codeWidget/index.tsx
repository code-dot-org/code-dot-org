import {ProjectFile} from '@codebridge/types';
import React, {useMemo, useState} from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';

import Workspace from './Workspace';

import styles from './codeWidget.module.scss';

interface CodeWidgetProps {
  studentCode?: Record<string, string>;
  gridWidth?: number;
  gridHeight?: number;
}

const CodeWidget: React.FC<CodeWidgetProps> = ({
  studentCode = {},
  gridWidth = 2,
  gridHeight = 2,
}) => {
  const [theme, setTheme] = useState<'Light' | 'Dark'>('Light');

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

  React.useEffect(() => {
    if (projectFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(projectFiles[0].id);
    }
  }, [projectFiles, selectedFileId]);

  const themeOptions = [
    {
      value: 'light',
      onClick: () => setTheme('Light'),
      label: 'Light Mode',
      icon: {iconName: 'sun'},
      isOptionDisabled: theme === 'Light',
    },
    {
      value: 'dark',
      onClick: () => setTheme('Dark'),
      label: 'Dark Mode',
      icon: {iconName: 'moon'},
      isOptionDisabled: theme === 'Dark',
    },
  ];

  return (
    <WidgetTemplate
      widgetName="Student Code"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      scrollable={true}
      settingsOptions={themeOptions}
    >
      <div data-theme={theme} className={styles.workspaceContainer}>
        <Workspace
          files={projectFiles}
          selectedFileId={selectedFileId}
          onFileSelect={setSelectedFileId}
          theme={theme}
        />
      </div>
    </WidgetTemplate>
  );
};

export default CodeWidget;
