import {Button} from '@code-dot-org/component-library/button';
import {ProjectFile} from '@codebridge/types';
import React, {useMemo, useState} from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';

import Editor from './Editor';

import styles from './studentCodeWidget.module.scss';

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

  const code = projectFiles[0]?.contents || '';

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'Light' ? 'Dark' : 'Light'));
  };

  return (
    <WidgetTemplate
      widgetName="Student Code"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      scrollable={true}
    >
      <div data-theme={theme} className={styles.workspaceContainer}>
        <div className={styles.themeToggle}>
          <Button
            onClick={toggleTheme}
            size="xs"
            type="secondary"
            text={theme === 'Light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          />
        </div>
        {/* FileTabs will go here in the next PR and share the same theme via data-theme attribute */}
        <Editor code={code} theme={theme} />
      </div>
    </WidgetTemplate>
  );
};

export default StudentCodeWidget;
