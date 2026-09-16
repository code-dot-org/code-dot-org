import React, {useMemo, useState, useEffect} from 'react';

import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';

import {CodeWidgetLevelInfo, INSTRUCTIONS_TAB_ID} from './types';
import Workspace from './Workspace';

import styles from './codeWidget.module.scss';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

interface CodeWidgetProps {
  codeData?: MultiFileSource;
  widgetName?: string;
  gridWidth?: number;
  gridHeight?: number;
  loading?: boolean;
  levelInfo?: CodeWidgetLevelInfo;
  emptyMessage?: string;
}

const CodeWidget = ({
  codeData,
  widgetName = 'Code',
  gridWidth = 2,
  gridHeight = 2,
  loading,
  levelInfo,
  emptyMessage,
}: CodeWidgetProps) => {
  const [theme, setTheme] = useState<'Light' | 'Dark'>('Light');

  // Convert student code to ProjectFile objects
  const projectFiles = useMemo<ProjectFile[]>(() => {
    if (!codeData?.files) return [];
    return Object.values(codeData.files).filter(
      file =>
        file.type !== ProjectFileType.SYSTEM_SUPPORT &&
        !IMAGE_EXTENSIONS.includes(getFileExtension(file.name))
    );
  }, [codeData]);

  const [selectedFileId, setSelectedFileId] = useState<string>('');

  useEffect(() => {
    if (projectFiles.length > 0) {
      // Select `index.html` if it exists, otherwise select the first file
      const indexHtmlFile = projectFiles.find(
        file => file.name === 'index.html'
      );
      setSelectedFileId(indexHtmlFile?.id ?? projectFiles[0].id);
    } else {
      setSelectedFileId(INSTRUCTIONS_TAB_ID);
    }
  }, [projectFiles]);

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
      widgetName={widgetName}
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      scrollable={true}
      settingsOptions={themeOptions}
      loading={loading}
    >
      <div data-theme={theme} className={styles.workspaceContainer}>
        <Workspace
          files={projectFiles}
          selectedFileId={selectedFileId}
          onFileSelect={setSelectedFileId}
          theme={theme}
          levelInfo={levelInfo}
          emptyMessage={emptyMessage}
        />
      </div>
    </WidgetTemplate>
  );
};

export default CodeWidget;
