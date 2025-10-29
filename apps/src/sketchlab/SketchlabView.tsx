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
} from '@excalidraw/excalidraw/types/types';
import React, {useEffect, useCallback, useRef, useState} from 'react';

import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  LabProps,
  LevelProperties,
  ProjectSources,
  ExcalidrawSourceWithExternalFiles,
  SketchlabExternalFiles,
} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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

// TO DO: add Jira to handle bad extensions.
const MIME_TO_EXT = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'image/jfif': 'jfif',
  'application/octet-stream': 'bin',
};

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 500;

async function uploadBase64ToUrl(
  dataUrl: string,
  uploadUrl: string,
  mimeType: string
): Promise<Response> {
  // Fetch the data URL to get a Blob (handles all decoding automatically)
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  console.log(`type: ${mimeType}`);
  // Create a File object from the Blob
  const file = new File([blob], 'file', {
    type: mimeType,
  });

  return await HttpClient.put(uploadUrl, file);
}

interface SerializedExcalidrawState {
  elements: ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
  externalFiles?: SketchlabExternalFiles;
}

interface SketchlabSources extends ProjectSources {
  source: ExcalidrawSourceWithExternalFiles;
}

const SketchlabView: React.FC<LabProps<LevelProperties>> = ({
  levelProperties,
}) => {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>();
  const {currentSources, updateSources, setReinitializationHandler} =
    useSources<SketchlabSources>();
  const saveSourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filesBeingUploadedRef = useRef<Set<string>>(new Set());

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

      saveSourcesTimeoutRef.current = setTimeout(async () => {
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

        // Note: does this every half second thing work in this context?
        // Might need to be faster if we want to quickly make sure that an upload succeeded.
        const savedFileIds = Object.keys(
          currentSources.source.externalFiles || {}
        );
        const excalidrawFileIds = Object.keys(serializedData.files || {});
        const difference = excalidrawFileIds.filter(
          id =>
            !savedFileIds.includes(id) && !filesBeingUploadedRef.current.has(id)
        );

        console.log('savedFileIds:', savedFileIds);
        console.log('excalidrawFileIds:', excalidrawFileIds);
        console.log('filesBeingUploaded:', filesBeingUploadedRef.current);

        // // Probably need actual comparison of keys
        // Don't rerun on update hook until the upload has finished?
        // Or, maybe just set a boolean that upload is happening.
        if (difference.length && serializedData.files) {
          difference.forEach(async fileId => {
            filesBeingUploadedRef.current.add(fileId);

            const newFile = serializedData.files[fileId];
            const extension = MIME_TO_EXT[newFile.mimeType];
            // note: rename to Url
            const externalUrl = `/v3/assets/${channelId}/${fileId}.${extension}`;

            // To do: what do we do if it fails?
            await uploadBase64ToUrl(
              newFile.dataURL,
              externalUrl,
              newFile.mimeType
            );

            const newExternalFile = {
              id: fileId,
              name: 'external',
              language: extension,
              contents: '',
              folderId: '1',
              url: externalUrl,
            };

            updateSources({
              source: {
                ...currentSources.source,
                externalFiles: {
                  ...currentSources.source.externalFiles,
                  [fileId]: newExternalFile,
                },
              },
            });
            filesBeingUploadedRef.current.delete(fileId);
          });
        }
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

  const convertToExcalidrawSources = (
    sourcesWithExternalFiles: ExcalidrawSourceWithExternalFiles
  ) => {
    // Currently doesn't do anything except update the type.
    // In the future, we'll need a step here that takes the external URLs and converts them to base64,
    // which will make them safe for Excalidraw to use.

    // Should this remove the externalFiles so that Excalidraw never sees it?
    // Maybe cloneDeep first?
    return sourcesWithExternalFiles as ExcalidrawInitialDataState;
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
