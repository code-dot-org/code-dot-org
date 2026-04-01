import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import type {TLEditorSnapshot} from '@tldraw/editor';
import React, {useEffect, useCallback, useRef, useState, useMemo} from 'react';
import {
  Tldraw,
  DefaultToolbar,
  SelectToolbarItem,
  HandToolbarItem,
  DrawToolbarItem,
  EraserToolbarItem,
  TextToolbarItem,
  RectangleToolbarItem,
  EllipseToolbarItem,
  TriangleToolbarItem,
  ArrowToolbarItem,
  HighlightToolbarItem,
  type Editor,
  type TLComponents,
} from 'tldraw';

import '../../node_modules/tldraw/tldraw.css';

import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {LabProps, LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useDialogControl} from '../lab2/views/dialogs';
import {BackpackAPIContext} from '../sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '../sharedComponents/backpack/BackpackClientApi';

import {Sketchlab2Sources} from './types';
import useSketchlab2Tour from './useSketchlab2Tour';
import {handleSaveToBackpack} from './utils';
import {uploadImageFile} from './utils/uploadImage';

import moduleStyles from './styles/sketchlab2-view.module.scss';

function CustomToolbarContent() {
  return (
    <DefaultToolbar>
      <SelectToolbarItem />
      <HandToolbarItem />
      <DrawToolbarItem />
      <EraserToolbarItem />
      <TextToolbarItem />
      <RectangleToolbarItem />
      <EllipseToolbarItem />
      <TriangleToolbarItem />
      <ArrowToolbarItem />
      <HighlightToolbarItem />
    </DefaultToolbar>
  );
}

const tldrawComponents: TLComponents = {
  Toolbar: CustomToolbarContent,
};

// Catches transient tldraw errors (e.g. shape component renders after
// deletion) so they don't trigger a full-screen dev overlay. The error
// still appears in the console.
class TldrawErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {errorKey: number}
> {
  state = {errorKey: 0};
  static getDerivedStateFromError() {
    // Bump key to remount children on next render
    return (prev: {errorKey: number}) => ({errorKey: prev.errorKey + 1});
  }
  render() {
    return (
      <React.Fragment key={this.state.errorKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

// Memoized wrapper prevents tldraw from re-rendering when the parent
// re-renders due to Redux source saves.
const TldrawCanvas = React.memo(function TldrawCanvas({
  mountKey,
  initialSnapshot,
  onMount,
  isDarkMode,
}: {
  mountKey: number;
  initialSnapshot: TLEditorSnapshot | undefined;
  onMount: (editor: Editor) => void;
  isDarkMode: boolean;
}) {
  return (
    <TldrawErrorBoundary>
      <Tldraw
        key={mountKey}
        snapshot={initialSnapshot}
        onMount={onMount}
        inferDarkMode={isDarkMode}
        components={tldrawComponents}
      />
    </TldrawErrorBoundary>
  );
});

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 500;

const DEFAULT_SOURCES = {source: {tldrawSnapshot: undefined}};

const Sketchlab2Canvas: React.FC<{
  levelProperties: LevelProperties;
}> = ({levelProperties}) => {
  const {
    currentSources,
    updateSources,
    setReinitializationHandler,
    showStartOverDialog,
  } = useSources<Sketchlab2Sources>();

  const editorRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

  // Remount key for when sources are reinitialized
  const [mountKey, setMountKey] = useState(0);

  const toolbarPosition = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sketchlab2-toolbar-position') === 'left'
      ? 'left'
      : 'top';
  }, []);

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('custom', commonI18n.startOverGeneric());
  }, [showStartOverDialog]);

  const {theme} = useTheme();

  const hasRun = useAppSelector(state => state.lab2System.hasRun);

  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const backpackContext = useMemo(() => {
    if (currentUserId) {
      return {primaryApi: new BackpackClientApi('sketchlab2', null)};
    }
    return null;
  }, [currentUserId]);
  const dialogControl = useDialogControl();

  // Build the initial snapshot to pass to <Tldraw> on mount
  const initialSnapshot = useMemo(
    () =>
      (currentSources.source.tldrawSnapshot as TLEditorSnapshot | undefined) ??
      undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mountKey]
  );

  // Debounced save of tldraw snapshot to project sources.
  // Uses requestAnimationFrame to defer the Redux update until after
  // tldraw finishes its render cycle (avoids re-rendering mid-deletion).
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const snapshot = editor.getSnapshot();
        const source = {tldrawSnapshot: snapshot};
        updateSources(() => ({source}));
      });
    }, DEBOUNCED_WORKSPACE_SERIALIZATION_MS);
  }, [updateSources]);

  // Clean up save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Called when tldraw editor mounts
  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      if (readonlyWorkspace) {
        editor.updateInstanceState({isReadonly: true});
      }

      // Save after each completed operation (fires after the full
      // transaction, not during — avoids re-rendering mid-deletion).
      editor.sideEffects.registerOperationCompleteHandler(source => {
        if (source === 'user') {
          debouncedSave();
        }
      });
    },
    [readonlyWorkspace, debouncedSave]
  );

  // Image upload handler
  const onFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || !channelId) return;
      const editor = editorRef.current;
      if (!editor) return;

      try {
        const url = await uploadImageFile(file, channelId);

        // Use tldraw's built-in external content handler to create the
        // image asset + shape from the uploaded URL.
        const asset = await editor.getAssetForExternalContent({
          type: 'url',
          url,
        });
        if (asset) {
          editor.createAssets([asset]);
          const center = editor.getViewportScreenCenter();
          const point = editor.screenToPage(center);
          const w = ('w' in asset.props ? (asset.props.w as number) : 200) / 2;
          const h = ('h' in asset.props ? (asset.props.h as number) : 150) / 2;
          editor.createShape({
            type: 'image',
            x: point.x - w / 2,
            y: point.y - h / 2,
            props: {assetId: asset.id, w, h},
          });
        }
      } catch {
        console.error('Failed to upload image');
      }
    },
    [channelId]
  );

  // Download as PNG using tldraw's built-in export
  const downloadPng = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const shapeIds = editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) return;

    try {
      const result = await editor.toImage([...shapeIds], {
        format: 'png',
        padding: 50,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = URL.createObjectURL(result.blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  }, []);

  // Save to backpack using tldraw's export
  const saveToBackpack = useCallback(() => {
    const api = backpackContext?.primaryApi;
    const editor = editorRef.current;
    if (!api || !editor) return;

    api.getFileList(
      () => {
        handleSaveToBackpack(editor, api, dialogControl, [], err =>
          console.error(err)
        );
      },
      (fileList: string[]) => {
        handleSaveToBackpack(editor, api, dialogControl, fileList, err =>
          console.error(err)
        );
      }
    );
  }, [backpackContext, dialogControl]);

  // Reinitialization handler for when sources change externally
  const reinitializationHandler = useCallback(() => {
    setMountKey(key => key + 1);
  }, []);

  const onLoadVersion = useCallback(
    (sources: ProjectSources) => {
      if (sources) {
        updateSources(sources as Sketchlab2Sources);
      }
      reinitializationHandler();
    },
    [updateSources, reinitializationHandler]
  );

  useEffect(() => {
    setReinitializationHandler(reinitializationHandler);
  }, [setReinitializationHandler, reinitializationHandler]);

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

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));
    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  useSketchlab2Tour({productTours: levelProperties.productTours});

  const teacherViewingStudent = Boolean(
    useAppSelector(state => state.progress.viewAsUserId)
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
    appName: 'sketchlab2',
  });

  const isDarkMode = theme.toLowerCase() === 'dark';

  return (
    <BackpackAPIContext.Provider value={backpackContext}>
      <div className={moduleStyles.sketchlab2Container}>
        <div style={{width: leftPanelWidth}} className={panelClassName}>
          <ResourcePanel
            levelProperties={levelProperties}
            isRunning={false}
            hasRun={hasRun}
            hasEdited={false}
            settings={[useThemeSetting('sketchlab2')]}
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
              saveFileToProject: () => {},
              createNewProjectFile: () => {},
              findIdForFileName: () => undefined,
              saveToBackpackButton: {
                onClick: async (
                  _fileList: string[],
                  _errorCallback: (error: string) => void
                ) => saveToBackpack(),
                text: 'Save Sketch to Backpack',
              },
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
            <div className={moduleStyles.tldrawWrapper}>
              <TldrawCanvas
                mountKey={mountKey}
                initialSnapshot={initialSnapshot}
                onMount={onMount}
                isDarkMode={isDarkMode}
              />
              {!readonlyWorkspace && (
                <div
                  className={`${moduleStyles.floatingToolbar} ${
                    toolbarPosition === 'left'
                      ? moduleStyles.floatingToolbarLeft
                      : ''
                  } sketchlab2-toolbar`}
                >
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image"
                    aria-label="Upload image"
                    type="button"
                    disabled={!channelId}
                  >
                    <FontAwesomeV6Icon iconStyle="solid" iconName="image" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={onFileInputChange}
                  />
                  <div className={moduleStyles.toolbarSeparator} />
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={downloadPng}
                    title="Download as PNG"
                    aria-label="Download as PNG"
                    type="button"
                  >
                    <FontAwesomeV6Icon iconStyle="solid" iconName="download" />
                  </button>
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={saveToBackpack}
                    title="Save to Backpack"
                    aria-label="Save to Backpack"
                    type="button"
                    disabled={!backpackContext}
                  >
                    <FontAwesomeV6Icon iconStyle="solid" iconName="briefcase" />
                  </button>
                </div>
              )}
            </div>
            {WorkspaceAlert}
          </PanelContainer>
        </div>
      </div>
    </BackpackAPIContext.Provider>
  );
};

export default (props: LabProps<LevelProperties>) => (
  <SourcesContainer
    {...props}
    defaultSources={DEFAULT_SOURCES}
    key={props.levelProperties.id}
  >
    <Sketchlab2Canvas levelProperties={props.levelProperties} />
  </SourcesContainer>
);
