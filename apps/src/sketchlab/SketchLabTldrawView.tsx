import {getAssetUrlsByMetaUrl} from '@tldraw/assets/urls';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Editor, getSnapshot, Tldraw, TLStoreSnapshot} from 'tldraw';
import 'tldraw/tldraw.css';

import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';

import {useSources} from '../lab2/views/SourcesContainer';

import {SketchlabTldrawSources} from './types';

import moduleStyles from './styles/sketchlab-view.module.scss';

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const SketchLabTldrawView: React.FC<LabProps<LevelProperties>> = ({
  levelProperties,
}) => {
  const themeSetting = useThemeSetting('sketchlab');
  //const tldrawEditorRef = useRef<Editor | null>(null);
  const [tldrawEditor, setTldrawEditor] = useState<Editor | null>(null);
  const {currentSources, updateSources} = useSources<SketchlabTldrawSources>();

  const parseSnapshot = (snapshotStr: string | undefined) => {
    if (!snapshotStr) {
      return undefined;
    }
    try {
      return JSON.parse(snapshotStr) as TLStoreSnapshot;
    } catch (e) {
      console.log('Error parsing snapshot', e);
      return undefined;
    }
  };
  const assetUrls = useMemo(() => getAssetUrlsByMetaUrl(), []);

  const initialSnapshotRef = useRef<TLStoreSnapshot | undefined>(
    parseSnapshot(currentSources?.source)
  );

  const initializeEditor = useCallback((editor: Editor) => {
    setTldrawEditor(editor);
    console.log('registering editor');
  }, []);

  useEffect(() => {
    if (tldrawEditor) {
      console.log('editor is ready, registering listener');
      const unsubscribe = tldrawEditor.store.listen(
        () => {
          const currentSnapshot = getSnapshot(tldrawEditor.store);
          const serializedSnapshot = JSON.stringify(currentSnapshot.document);
          updateSources({source: serializedSnapshot});
        },
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
              onMount={initializeEditor}
              snapshot={initialSnapshotRef.current}
            />
          </div>
        </PanelContainer>
      </div>
    </div>
  );
};

export default SketchLabTldrawView;
