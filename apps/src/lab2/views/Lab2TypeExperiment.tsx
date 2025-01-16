import React, {useEffect, useState} from 'react';

import {AppName, ProjectSources} from '../types';

// Common level properties interface for all labs
interface BaseLevelProperties<T extends AppName> {
  appName: T;
  isProjectLevel?: boolean;
  hideAndShareRemix?: boolean;
  // ... other common stuff
}

// Some examples of lab-specific properties...

interface MusicLevelProperties extends BaseLevelProperties<'music'> {
  library: object;
}

interface PythonLevelProps extends BaseLevelProperties<'pythonlab'> {
  validationCode: string;
}

// Here we map each app to its specific level properties type
type LevelPropertiesMap = {
  music: MusicLevelProperties;
  pythonlab: PythonLevelProps;

  // Connect other lab-specific types here.
  // Currently just filling out the rest with base level props to make TS happy.
  aichat: BaseLevelProperties<'aichat'>;
  dance: BaseLevelProperties<'dance'>;
  panels: BaseLevelProperties<'panels'>;
  standalone_video: BaseLevelProperties<'standalone_video'>;
  weblab2: BaseLevelProperties<'weblab2'>;
};

// Assume we have some selector to get the app for the current level before we load level props...
function getAppType(levelId: number): AppName {
  // Fake implementation
  return levelId % 2 === 0 ? 'music' : 'pythonlab';
}

// Assume this does all the work to load level properties and sources for a given level (like we do in lab2Redux currently)
async function loadData<T extends AppName>(
  levelId: number
): Promise<LevelPropertiesMap[T]> {
  const app = getAppType(levelId);
  if (app === 'music') {
    // ✅ TS ensures that this is a MusicLevelProperties
    return {appName: app, library: {}} as LevelPropertiesMap[T];
  }
  if (app === 'pythonlab') {
    // ✅ TS ensures that this is a PythonLevelProperties
    return {appName: app, validationCode: 'code'} as LevelPropertiesMap[T];
  }

  throw new Error('Unknown app type');
}

// Props type for Lab view components
interface LabProps<T extends AppName> {
  levelProperties: LevelPropertiesMap[T];
  initialSources: ProjectSources;
}

// Sample lab-specific views that use lab-specific props that are automatically typed
const MusicLab: React.FC<LabProps<'music'>> = ({
  levelProperties,
  initialSources,
}) => {
  return (
    <div>{`Music Lab using lab-specific props! Library: ${levelProperties.library}`}</div>
  );
};

const PythonLab: React.FC<LabProps<'pythonlab'>> = ({
  levelProperties,
  initialSources,
}) => {
  return (
    <div>{`Python Lab using lab-specific props! Validation code: ${levelProperties.validationCode}`}</div>
  );
};

// Here we map each lab type to its view component (we could roll this into lab2EntryPoints)
const AppTypeMap: {[K in AppName]?: React.FC<LabProps<K>>} = {
  music: MusicLab,
  pythonlab: PythonLab,
};

// Simple Lab Container view that loads level properties and renders the appropriate lab view
const LabContainer: React.FC<{levelId: number}> = ({levelId}) => {
  const [levelProperties, setLevelProperties] =
    useState<LevelPropertiesMap[AppName]>();

  useEffect(() => {
    // Reload data whenever level changes
    loadData(levelId).then(setLevelProperties);
  }, [levelId]);

  if (!levelProperties) {
    return null;
  }

  // Use the loaded level props to render the appropriate lab view
  const appName = levelProperties.appName;
  const AppView = AppTypeMap[appName] as React.FC<LabProps<typeof appName>>;

  return (
    <AppView levelProperties={levelProperties} initialSources={{source: ''}} />
  );
};

export default LabContainer;
