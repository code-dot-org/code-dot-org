import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {getLevelPropertiesPath} from '@cdo/apps/code-studio/progressReduxSelectors';

import {LevelProperties, ProjectSources} from '../types';

import Loading from './Loading';

/**
 * These are the top-level parameters provided to the Lab2 system.
 * Generally, these *don't* change between levels in a lab and
 * are only fetched on initial page load.
 *
 * This is primarily just App Options/App Options-derived data
 * (pretty much just PartialAppOptions in utils.ts).
 */
interface Lab2WrapperProps {
  standaloneProjectId?: string;
  appOptionsLevelId?: number;
  editBlocks?: 'start_sources';
  // ... etc
}

/**
 * This is the data provided to individual labs as props.
 * These will change between levels in a lab and are fetched
 * whenever the level changes or resets.
 */
interface LabData {
  levelProperties: LevelProperties; // Might be a fancy TS way to make this lab-specific
  startSources?: ProjectSources; // Optional because not all labs are project-backed
}

/**
 * We can use this type in lab2EntryPoints.ts to enforce that LabViews can accept
 * these props.
 */
export type LabProps = Lab2WrapperProps & LabData;

const Lab2Wrapper2: React.FC<Lab2WrapperProps> = (/* ... props ... */) => {
  // 1. We store the current lab's data as internal state and NOT in Redux.
  // This way, the Lab2 wrapper controls how and when labs access their data,
  // to ensure it's always loaded and ready before mounting the lab view.
  // If undefined, no lab has loaded and we can show a loading screen.
  const [labData, setLabData] = useState<LabData | undefined>();

  const loadLabData = async (levelPropertiesPath: string): Promise<LabData> => {
    // This would be mostly the same as what we currently do in lab2Redux (maybe in a separate file)
    // except that we will save data to our local state instead of dispatching redux updates.
    // const levelProperties = await fetchLevelProperties(levelPropertiesPath);
    // ...
    return {} as unknown as LabData;
  };

  // 2. Similar to ProjectContainer; when the current level ID changes,
  // we load the lab's data, except here we will set it in internal state,
  // and make sure to clear it out before loading the next lab.

  const levelPropertiesPath = useSelector(getLevelPropertiesPath);
  useEffect(() => {
    if (!levelPropertiesPath) {
      return;
    }

    setLabData(undefined);
    loadLabData(levelPropertiesPath).then(labData => setLabData(labData));
  }, [levelPropertiesPath]);

  // 3. Render based on the current lab data. If lab data is undefined, show a loading screen.
  // Otherwise, render the appropriate lab view.

  if (!labData) {
    return <Loading isLoading={true} />;
  }

  // Use lab2EntryPoints to lazy load the lab view, i.e.:
  // const LabView = lab2EntryPoints[labData.levelProperties.appName].view;
  // const labProps = {...labData, ...props};
  // return (
  //   <Suspense fallback={<Loading isLoading={true} />}>
  //     <LabView {...labProps} />
  //   </Suspense>
  // );
  return null;
};

export default Lab2Wrapper2;
