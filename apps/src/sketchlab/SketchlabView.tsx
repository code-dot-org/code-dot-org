import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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
import {Button as MuiButton} from '@mui/material';
import cloneDeep from 'lodash/cloneDeep';
import React, {useEffect, useCallback, useRef, useState, useMemo} from 'react';

import DCDO from '@cdo/apps/dcdo';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {LabProps, LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import IntroJSTourWrapper from '@cdo/apps/lab2/views/components/IntroJSTourWrapper';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import {commonI18n} from '@cdo/apps/types/locale';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useDialogControl} from '../lab2/views/dialogs';
import {BackpackAPIContext} from '../sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '../sharedComponents/backpack/BackpackClientApi';

import SketchLabTldrawView from './SketchLabTldrawView';
import SketchlabTourSteps from './sketchlabTourSteps';
import {SketchlabSources, SerializedExcalidrawState} from './types';
import useSketchlabShepherdTour from './useSketchlabShepherdTour';
import {
  handleSaveToBackpack,
  generateNewExternalFiles,
  populateInitialExcalidrawState,
  uploadExternalFiles,
} from './utils';

import moduleStyles from './styles/sketchlab-view.module.scss';

const MIN_INFO_PANEL_WIDTH = 250;
// This initial width is derived from the following:
// The narrowest screen we see in GA with 1% usage is 1024px.
// The version of Excalidraw we're using switches into a mobile mode at 730px.
// So, we want to make sure the initial workspace is over 730px.
// 1024 - 290 - 1px for resize bar = 734px.
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 200;

const DEFAULT_SOURCES = {source: {}};

const SketchlabView: React.FC<LabProps<LevelProperties>> = ({
  levelProperties,
}) => {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>();
  const {
    currentSources,
    updateSources,
    setReinitializationHandler,
    showStartOverDialog,
  } = useSources<SketchlabSources>();

  const saveSourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keeps track of files that we are in the process of uploading, so that we don't attempt to reupload
  // while a request is in flight.
  const filesBeingUploadedRef = useRef<Set<string>>(new Set());

  const initialErrors = useRef<Error[]>([]);

  // Keeps a cache of files that we already have downloaded, so that we don't request them repeatedly.
  const downloadedFilesDataRef = useRef<
    Record<ExcalidrawElement['id'], DataURL>
  >({});

  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('custom', commonI18n.startOverGeneric());
  }, [showStartOverDialog]);

  const {theme} = useTheme();

  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

  // We remount (ie, reset) Excalidraw any time we observe
  // sources being initialized (eg, when level changes, teacher views a student's project, etc).
  const [excalidrawMountKey, setExcalidrawMountKey] = useState(0);

  const onLoad = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      // Retain the API reference
      excalidrawApiRef.current = api;

      // Signal any loading errors
      if (initialErrors.current.length > 0) {
        api.setToast({
          message: `\u{2757} ${initialErrors.current[0].message}`,
        });
      }
    },
    [excalidrawApiRef]
  );

  const onError = useCallback((error: Error) => {
    const api = excalidrawApiRef.current;
    if (api) {
      // The app is loaded, so just pop up the error
      api.setToast({
        message: `\u{2757} ${error.message}`,
      });
    } else {
      // Defer the error until the application loads
      initialErrors.current.push(error);
    }
    console.error(error);
  }, []);

  const initialData = useMemo(() => {
    // Clone the sources to ensure we don't accidentally mutate the original object (which is frozen/immutable),
    // since Excalidraw mutates the initial data object that is passed in.
    const clonedSource = cloneDeep(
      currentSources.source
    ) as ExcalidrawInitialDataState;

    return populateInitialExcalidrawState(
      clonedSource,
      downloadedFilesDataRef.current,
      onError
    );
  }, [currentSources.source, onError]);

  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const backpackContext = useMemo(() => {
    // The backpack api does not work for signed-out users (it redirects to sign-in),
    // so we don't create the api instance if there is no current user.
    if (currentUserId) {
      return {primaryApi: new BackpackClientApi('sketchlab', null)};
    }
    return null;
  }, [currentUserId]);
  const dialogControl = useDialogControl();

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

        const savedFiles = currentSources.source.externalFiles || {};
        const excalidrawFiles = serializedData.files;
        const levelName = levelProperties.name;

        const savedFileIds = Object.keys(savedFiles || {});
        const excalidrawFileIds = Object.keys(excalidrawFiles || {});
        const newFileIds = excalidrawFileIds.filter(
          id =>
            !savedFileIds.includes(id) && !filesBeingUploadedRef.current.has(id)
        );

        const newFiles = generateNewExternalFiles(
          newFileIds,
          excalidrawFiles,
          levelName,
          channelId
        );

        // We remove base64 encoded images from the serialized data before storing them to a student's project.
        // The images are instead uploaded to/retrieved from S3.
        // Including an experiment flag as well in case we observe issues and need to turn this off quickly.
        Object.entries(serializedData.files).forEach(([id, file]) => {
          if (
            savedFiles[id]?.uploaded &&
            DCDO.get('sketchlab-s3-image-storage', true)
          ) {
            delete file.dataURL;
          }
        });

        updateSources(prevSources => ({
          source: {
            ...serializedData,
            externalFiles: {
              ...prevSources.source.externalFiles,
              ...newFiles,
            },
          },
        }));

        if (newFiles && !readonlyWorkspace) {
          const newFilesWithUploadStatus = await uploadExternalFiles(
            newFiles,
            serializedData.files,
            filesBeingUploadedRef
          );

          updateSources(prevSources => ({
            source: {
              ...prevSources.source,
              externalFiles: {
                ...prevSources.source.externalFiles,
                ...newFilesWithUploadStatus,
              },
            },
          }));
        }
      }, DEBOUNCED_WORKSPACE_SERIALIZATION_MS);
    },
    [
      updateSources,
      channelId,
      currentSources.source,
      levelProperties.name,
      readonlyWorkspace,
    ]
  );

  useEffect(() => {
    return () => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
      }
    };
  }, []);

  const reinitializationHandler = useCallback(() => {
    setExcalidrawMountKey(key => key + 1);
  }, []);

  const onLoadVersion = useCallback(
    (sources: ProjectSources) => {
      if (sources) {
        updateSources(sources as SketchlabSources);
      }
      reinitializationHandler();
    },
    [updateSources, reinitializationHandler]
  );

  useEffect(() => {
    setReinitializationHandler(reinitializationHandler);
  }, [setReinitializationHandler, reinitializationHandler]);

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

  const showShepherdProductTours = experiments.isEnabledAllowingQueryString(
    experiments.SHEPHERD_PRODUCT_TOURS
  );
  useSketchlabShepherdTour();

  const teacherViewingStudent = Boolean(
    useAppSelector(state => state.progress.viewAsUserId)
  );

  return (
    <BackpackAPIContext.Provider value={backpackContext}>
      <div className={moduleStyles.sketchlabContainer}>
        {!showShepherdProductTours && (
          <IntroJSTourWrapper enabled={true}>
            <SketchlabTourSteps />
          </IntroJSTourWrapper>
        )}
        <div style={{width: leftPanelWidth}} className={panelClassName}>
          <ResourcePanel
            levelProperties={levelProperties}
            isRunning={false}
            hasRun={hasRun}
            hasEdited={false}
            settings={[useThemeSetting('sketchlab')]}
            versionHistoryProps={{
              startSources:
                (levelProperties?.startSources as ProjectSources) ||
                DEFAULT_SOURCES,
              onLoadVersion: onLoadVersion,
            }}
            backpackProps={{
              validateFileName: (fileName: string) => ({
                isSupportFileName: false,
                newFileName: fileName,
              }),
              // Sketch Lab doesn't support importing Backpack files into
              // the project, so we provide dummy methods.
              saveFileToProject: () => {},
              createNewProjectFile: () => {},
              findIdForFileName: () => undefined,
              saveToBackpackButton: {
                onClick: (
                  fileList: string[],
                  errorCallback: (error: string) => void
                ) =>
                  handleSaveToBackpack(
                    excalidrawApiRef.current,
                    backpackContext?.primaryApi,
                    dialogControl,
                    fileList,
                    errorCallback
                  ),
                text: 'Save Sketch to Backpack',
              },
              // We don't currently support importing backpack files, so this list is empty.
              supportedFileTypes: [],
            }}
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
            rightHeaderContent={
              !readonlyWorkspace && (
                <MuiButton
                  variant="outlined"
                  color="tertiary"
                  size="extraSmall"
                  onClick={onClickStartOver}
                  aria-label={commonI18n.startOver()}
                  type="button"
                  endIcon={
                    <FontAwesomeV6Icon
                      iconStyle="solid"
                      iconName="arrow-rotate-left"
                    />
                  }
                >
                  {commonI18n.startOver()}
                </MuiButton>
              )
            }
          >
            {teacherViewingStudent && (
              <TeacherViewingStudentProjectAlert inWorkspaceContainer />
            )}
            <Excalidraw
              initialData={initialData}
              onChange={debouncedSerializeAndSaveWorkspace}
              excalidrawAPI={onLoad}
              key={excalidrawMountKey}
              theme={theme.toLowerCase() as ExcalidrawTheme}
              viewModeEnabled={readonlyWorkspace}
            />
            {WorkspaceAlert}
          </PanelContainer>
        </div>
      </div>
    </BackpackAPIContext.Provider>
  );
};

export default (props: LabProps<LevelProperties>) => {
  if (experiments.isEnabled(experiments.TLDRAW)) {
    return <SketchLabTldrawView {...props} />;
  }
  return (
    <SourcesContainer
      {...props}
      defaultSources={DEFAULT_SOURCES}
      key={props.levelProperties.id}
    >
      <SketchlabView levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
};
