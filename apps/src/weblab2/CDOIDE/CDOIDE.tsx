import {
  CDOIDEContextProvider,
  projectReducer,
  useProjectUtilities,
} from '@cdoide/cdoIDEContext';
import {CenterPane} from '@cdoide/CenterPane';
import {LeftPane} from '@cdoide/LeftPane';
import {RightPane} from '@cdoide/RightPane';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from '@cdoide/types';
import React, {useRef, useReducer, useEffect} from 'react';
import './styles/cdoIDE.css';

type CDOIDEProps = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
};

type PaneKey = {
  key: keyof typeof configVisibilityDefaults;
};

const configVisibilityDefaults = {
  showPreview: true,
  showEditor: true,
  showLeftNav: true,
};

const getConfigVisibilityVal = (
  key: keyof typeof configVisibilityDefaults,
  config: ConfigType
) => {
  return config[key] ?? configVisibilityDefaults[key] ?? false;
};

const paneWidths: (PaneKey & {width: string})[] = [
  {key: 'showLeftNav', width: '1fr'},
  {key: 'showPreview', width: '2fr'},
  {key: 'showEditor', width: '2fr'},
];

const paneHeights: (PaneKey & {height: string})[] = [];

export const CDOIDE = React.memo(
  ({project, config, setProject, setConfig}: CDOIDEProps) => {
    // keep track of if we should fire the callback in case of a project change. The only time we
    // do -not- want to do it is if replaceProject was called, which only happens once in an effect here
    const shouldNotifyProjectUpdate = useRef(true);
    const [internalProject, dispatch] = useReducer(projectReducer, project);
    const projectUtilities = useProjectUtilities(dispatch);

    // now, when anything has been dispatched, and our internalProject has changed we should
    // notify the external callback. UNLESS it's been disabled.
    // regardless, we always re-enable updates after we're done.
    // There's only one time when we don't want to call the callback, and that's when
    // we're replacing the project itself in the next effect

    useEffect(() => {
      if (shouldNotifyProjectUpdate.current) {
        setProject(internalProject);
      }
      shouldNotifyProjectUpdate.current = true;
    }, [internalProject, setProject]);

    // okay, so if we replace the project itself, we need to confirm that it actually changed
    // And we can't do it by checking against the internalProject here, oh no, because that would
    // require internalProject to be a dependency on this effect. Instead, we hand through our place
    // to store whether we should fire off the next update. Internally, the reducer will set the flag
    // to true if we're ACTUALLY replacing the project, which will then make it all work and sync up.
    //
    // Yes, this is a little crazy. Yes, I think this should be refactored out into a wrapper that
    // explicitly calls setProject only on appropriate actions. Yes, I'll look into it.
    useEffect(() => {
      projectUtilities.replaceProject(project, shouldNotifyProjectUpdate);
    }, [project, projectUtilities]);

    const outerGridRows = ['auto'];
    paneHeights.forEach(pair => {
      if (getConfigVisibilityVal(pair.key, config)) {
        outerGridRows.push(pair.height);
      }
    });

    const innerGridCols: string[] = [];
    paneWidths.forEach(pair => {
      if (getConfigVisibilityVal(pair.key, config)) {
        innerGridCols.push(pair.width);
      }
    });
    return (
      <CDOIDEContextProvider
        value={{
          project: internalProject,
          config,
          setProject,
          setConfig,
          ...projectUtilities,
        }}
      >
        <div
          className="cdo-ide-outer"
          style={{gridTemplateRows: outerGridRows.join(' ')}}
        >
          <div
            className="cdo-ide-inner"
            style={{
              gridTemplateColumns: innerGridCols.join(' '),
            }}
          >
            {getConfigVisibilityVal('showLeftNav', config) && (
              <div className="cdo-ide-area">
                <LeftPane />
              </div>
            )}
            {getConfigVisibilityVal('showEditor', config) && (
              <div className="cdo-ide-area">
                <CenterPane />
              </div>
            )}
            {getConfigVisibilityVal('showPreview', config) && <RightPane />}
          </div>
        </div>
      </CDOIDEContextProvider>
    );
  }
);
