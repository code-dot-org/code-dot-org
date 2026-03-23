import {getAssetUrlsByMetaUrl} from '@tldraw/assets/urls';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Editor,
  getSnapshot,
  Tldraw,
  TLStoreSnapshot,
  TLUiOverrides,
} from 'tldraw';
import 'tldraw/tldraw.css';

import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useSources} from '../lab2/views/SourcesContainer';

import {SketchlabTldrawSources} from './types';
import {createTldrawAssetStore} from './utils/createTldrawAssetStore';

import moduleStyles from './styles/sketchlab-view.module.scss';

// TLStoreSnapshot requires { store: object, schema: object }.
// We could have an invalid source if we have excalidraw data stored.
// todo: actually migrate the old data.
function isValidSnapshot(
  source: SketchlabTldrawSources['source'] | undefined
): source is TLStoreSnapshot {
  return (
    typeof source === 'object' &&
    source !== null &&
    'store' in source &&
    typeof source.store === 'object' &&
    'schema' in source &&
    typeof source.schema === 'object'
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
  const initialSnapshotRef = useRef<TLStoreSnapshot | undefined>(
    isValidSnapshot(currentSources?.source) ? currentSources.source : undefined
  );

  const assetStore = useMemo(
    () =>
      createTldrawAssetStore(
        channelId,
        levelProperties.name,
        initialSnapshotRef.current
      ),
    [channelId, levelProperties.name]
  );

  const assetUrls = useMemo(() => getAssetUrlsByMetaUrl(), []);

  const initializeEditor = useCallback((editor: Editor) => {
    setTldrawEditor(editor);
    console.log('registering editor');
  }, []);

  useEffect(() => {
    if (tldrawEditor) {
      console.log('editor is ready, registering listener');
      // listen method returns a method you can use to unsubscribe, so we return that from the effect.
      // https://tldraw.dev/reference/store/Store#listen
      const unsubscribe = tldrawEditor.store.listen(
        () => {
          updateSources({source: getSnapshot(tldrawEditor.store).document});
        },
        // We are only listening to 'document' changes because 'session' changes are things like cursor location,
        // etc. We won't save those.
        // https://tldraw.dev/sdk-features/store#Saving-state
        {source: 'all', scope: 'document'}
      );
      return () => {
        unsubscribe();
      };
    }
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
              // docs for snapshot: https://tldraw.dev/reference/editor/TLStoreBaseOptions#snapshot
              // We may be able to use snapshot in conjunction with migrations to migrate old excalidraw
              // data: https://tldraw.dev/sdk-features/persistence#Migrations
              snapshot={initialSnapshotRef.current}
            />
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default SketchLabTldrawView;
