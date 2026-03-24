import {getAssetUrlsByMetaUrl} from '@tldraw/assets/urls';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Editor,
  getSnapshot,
  Tldraw,
  TLEditorSnapshot,
  TLUiOverrides,
} from 'tldraw';
import 'tldraw/tldraw.css';

import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {
  ExcalidrawSourceWithExternalFiles,
  LabProps,
  LevelProperties,
} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useSources} from '../lab2/views/SourcesContainer';

import {SketchlabTldrawSources} from './types';
import {createTldrawAssetStore} from './utils/createTldrawAssetStore';
import {
  isExcalidrawSource,
  migrateExcalidrawToTldraw,
} from './utils/migrateExcalidrawToTldraw';

import moduleStyles from './styles/sketchlab-view.module.scss';
const UPDATE_SOURCES_DEBOUNCE_MS = 200;

// TLEditorSnapshot requires { document: { store: object, schema: object }, session: object }.
function isValidSnapshot(
  source: SketchlabTldrawSources['source'] | undefined
): source is TLEditorSnapshot {
  if (typeof source !== 'object' || source === null) return false;
  const doc = (source as TLEditorSnapshot).document;
  return (
    typeof doc === 'object' &&
    doc !== null &&
    typeof doc.store === 'object' &&
    typeof doc.schema === 'object'
  );
}

const uiOverrides: TLUiOverrides = {
  actions(_editor, actions) {
    // Remove insert-embed action which allows users to insert potentially unsafe URLs,
    // and could be generally confusing.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {'insert-embed': _unused, ...rest} = actions;
    return rest;
  },
};

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const SketchLabTldrawView: React.FC<LabProps<LevelProperties>> = ({
  levelProperties,
}) => {
  const themeSetting = useThemeSetting('sketchlab');
  const [tldrawEditor, setTldrawEditor] = useState<Editor | null>(null);
  const {currentSources, updateSources} = useSources<SketchlabTldrawSources>();

  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';
  const initialSnapshotRef = useRef<TLEditorSnapshot | undefined>(
    isValidSnapshot(currentSources?.source) ? currentSources.source : undefined
  );

  const assetStore = useMemo(
    () =>
      createTldrawAssetStore(
        channelId,
        levelProperties.name,
        initialSnapshotRef.current?.document
      ),
    [channelId, levelProperties.name]
  );

  const assetUrls = useMemo(() => getAssetUrlsByMetaUrl(), []);

  const excalidrawSourceRef = useRef(
    isExcalidrawSource(currentSources?.source) ? currentSources.source : null
  );

  const initializeEditor = useCallback((editor: Editor) => {
    setTldrawEditor(editor);
  }, []);

  useEffect(() => {
    if (tldrawEditor && excalidrawSourceRef.current) {
      const source =
        excalidrawSourceRef.current as unknown as ExcalidrawSourceWithExternalFiles;
      excalidrawSourceRef.current = null;
      migrateExcalidrawToTldraw(tldrawEditor, source);
    }
  }, [tldrawEditor]);

  useEffect(() => {
    if (!tldrawEditor) return;

    const saveSnapshot = () => {
      updateSources({source: getSnapshot(tldrawEditor.store)});
    };

    // Tldraw fires updates on every change, which can be very frequent (dragging, drawing, etc.),
    // so we debounce to avoid flooding updateSources with re-renders and deep-equality checks.
    let debounceTimer: number | undefined;
    const handleChange = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(
        saveSnapshot,
        UPDATE_SOURCES_DEBOUNCE_MS
      );
    };

    // listen method returns a method you can use to unsubscribe, so we return that from the effect.
    // https://tldraw.dev/reference/store/Store#listen
    const unsubscribe = tldrawEditor.store.listen(handleChange, {
      source: 'all',
    });

    return () => {
      unsubscribe();
      // Flush any pending debounced update so in-app level navigation
      // doesn't lose the last edit before the timer fires.
      window.clearTimeout(debounceTimer);
      saveSnapshot();
    };
  }, [tldrawEditor, updateSources]);

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

  return (
    <div className={moduleStyles.sketchlabContainer}>
      <div style={{width: leftPanelWidth}} className={panelClassName}>
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={true}
          hasEdited={false}
          settings={[themeSetting]}
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
          <div style={{height: '100%', position: 'relative'}}>
            <Tldraw
              assetUrls={assetUrls}
              assets={assetStore}
              onMount={initializeEditor}
              overrides={uiOverrides}
              // https://tldraw.dev/reference/editor/TLStoreBaseOptions#snapshot
              snapshot={initialSnapshotRef.current}
            />
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default SketchLabTldrawView;
