import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {Excalidraw, serializeAsJSON} from '@excalidraw/excalidraw';
import {
  ExcalidrawElement,
  Theme as ExcalidrawTheme,
} from '@excalidraw/excalidraw/types/element/types';
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  DataURL,
} from '@excalidraw/excalidraw/types/types';
import cloneDeep from 'lodash/cloneDeep';
import React, {useEffect, useCallback, useRef, useState} from 'react';

import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  LabProps,
  LevelProperties,
  ExcalidrawSourceWithExternalFiles,
} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {SketchlabSources, SerializedExcalidrawState} from './types';
import uploadExternalFiles from './utils/uploadExternalFiles';

import moduleStyles from './styles/sketchlab-view.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
// This initial width is derived from the following:
// The narrowest screen we see in GA with 1% usage is 1024px.
// The version of Excalidraw we're using switches into a mobile mode at 730px.
// So, we want to make sure the initial workspace is over 730px.
// 1024 - 290 - 1px for resize bar = 734px.
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 500;

const SketchlabView: React.FC<LabProps<LevelProperties>> = ({
  levelProperties,
}) => {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>();
  const {currentSources, updateSources, setReinitializationHandler} =
    useSources<SketchlabSources>();
  const saveSourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filesBeingUploadedRef = useRef<Set<string>>(new Set());
  const downloadedFileDataRef = useRef<
    Record<ExcalidrawElement['id'], DataURL>
  >({});

  const {theme} = useTheme();

  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

  // We remount (ie, reset) Excalidraw any time we observe
  // sources being initialized (eg, when level changes, teacher views a student's project, etc).
  const [excalidrawMountKey, setExcalidrawMountKey] = useState(0);

  const WorkspaceAlert = useLevelEditMode<LevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        return {
          [mode === 'start' ? 'start_sources' : 'exemplar_sources']:
            currentSources,
        };
      },
      [currentSources]
    )
  );

  const {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps: panelSeparatorProps,
    leftPanelDragging: isDragging,
    panelClassName,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: MIN_INFO_PANEL_WIDTH,
      initialWidth: INITIAL_INFO_PANEL_WIDTH,
      name: 'instructions',
    },
    rightPanel: {
      minWidth: MIN_WORKSPACE_WIDTH,
      initialWidth: INITIAL_WORKSPACE_WIDTH,
      name: 'workspace',
    },
    appName: 'sketchlab',
  });

  // Excalidraw runs its onChange every time the cursor moves,
  // so we debounce actually serializing the workspace to stringified JSON.
  const debouncedSerializeAndSaveWorkspace = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      state: AppState,
      files: BinaryFiles
    ) => {
      // In start mode, we manage saving explicitly via the button in the header.
      if (getIsStartMode()) {
        return;
      }

      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
        saveSourcesTimeoutRef.current = null;
      }

      saveSourcesTimeoutRef.current = setTimeout(() => {
        const serializedData: SerializedExcalidrawState = JSON.parse(
          serializeAsJSON(elements, state, files, 'local')
        );

        const excalidrawApi = excalidrawApiRef.current;
        if (excalidrawApi) {
          // serializeAsJSON exports an extremely limited set of properties from appState,
          // and excludes the chosen scroll position (scrollX/Y) and zoom, so we use the API to serialize those manually.
          const appState = excalidrawApi.getAppState();
          serializedData.appState.scrollX = appState.scrollX;
          serializedData.appState.scrollY = appState.scrollY;
          serializedData.appState.zoom = appState.zoom;
        }

        updateSources({
          source: {
            ...serializedData,
            externalFiles: {...currentSources.source.externalFiles},
          },
        });

        uploadExternalFiles(
          currentSources.source,
          serializedData,
          filesBeingUploadedRef,
          channelId,
          updateSources
        );
      }, DEBOUNCED_WORKSPACE_SERIALIZATION_MS);
    },
    [updateSources, channelId, currentSources.source]
  );

  useEffect(() => {
    return () => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setReinitializationHandler(() => setExcalidrawMountKey(key => key + 1));
  }, [setReinitializationHandler]);

  // Since there's no run button in Sketch Lab, set it to true by default
  // to enable the Submit button on edit on submittable levels.
  // Set back to false on unmount in case we switch to a different level type.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));

    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  // UseMemo on result so that we do not refetch unnecessarily?
  const convertToExcalidrawSources = async (
    sourcesWithExternalFiles: ExcalidrawSourceWithExternalFiles
  ) => {
    const excalidrawInitialState = cloneDeep(sourcesWithExternalFiles);
    Object.values(excalidrawInitialState?.files || {}).forEach(
      file => delete file.dataURL
    );

    if (excalidrawInitialState.externalFiles) {
      const imageDownloadPromises = Object.values(
        excalidrawInitialState.externalFiles
      ).map(async file => {
        if (file.url) {
          if (!Object.keys(downloadedFileDataRef.current).includes(file.id)) {
            await imageUrlToBase64(file.url)
              .then(base64 => {
                // handle empty files?
                if (excalidrawInitialState.files) {
                  excalidrawInitialState.files[file.id].dataURL =
                    base64 as DataURL;
                  downloadedFileDataRef.current[file.id] = base64 as DataURL;
                }
              })
              .catch(error => {
                // what to do on error?
                console.error(error);
              });
          } else {
            if (excalidrawInitialState.files) {
              const base64 = downloadedFileDataRef.current[file.id];
              excalidrawInitialState.files[file.id].dataURL = base64;
            }
          }
        }
      });
      await Promise.allSettled(imageDownloadPromises);
    }

    delete excalidrawInitialState.externalFiles;
    return excalidrawInitialState as ExcalidrawInitialDataState;
  };

  return (
    <div className={moduleStyles.sketchlabContainer}>
      <div style={{width: leftPanelWidth}} className={panelClassName}>
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={hasRun}
          hasEdited={false}
          settings={[useThemeSetting('sketchlab')]}
        />
      </div>
      <ResizeBar
        isVertical={true}
        separatorProps={panelSeparatorProps}
        isDragging={isDragging}
      />
      <div style={{width: rightPanelWidth}}>
        <PanelContainer
          id="workspace"
          className={panelClassName}
          headerContent={<WorkspaceHeader />}
        >
          <Excalidraw
            initialData={convertToExcalidrawSources(currentSources.source)}
            onChange={debouncedSerializeAndSaveWorkspace}
            excalidrawAPI={api => (excalidrawApiRef.current = api)}
            key={excalidrawMountKey}
            theme={theme.toLowerCase() as ExcalidrawTheme}
          />
          {WorkspaceAlert}
        </PanelContainer>
      </div>
    </div>
  );
};

export default (props: LabProps<LevelProperties>) => (
  <SourcesContainer {...props} defaultSources={{source: {}}}>
    <SketchlabView levelProperties={props.levelProperties} />
  </SourcesContainer>
);
