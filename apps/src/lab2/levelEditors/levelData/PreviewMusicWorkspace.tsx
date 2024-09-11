import React, {useEffect, useRef} from 'react';

import MusicBlocklyWorkspace from '@cdo/apps/music/blockly/MusicBlocklyWorkspace';
import {ToolboxData} from '@cdo/apps/music/blockly/toolbox/types';
import {BlockMode} from '@cdo/apps/music/constants';
import {ValueOf} from '@cdo/apps/types/utils';

import styles from './edit-music-level-data.module.scss';

interface PreviewMusicWorkspaceProps {
  toolboxData: ToolboxData;
  blockMode: ValueOf<typeof BlockMode>;
  startSources?: object;
}

const PreviewMusicWorkspace: React.FC<PreviewMusicWorkspaceProps> = ({
  toolboxData,
  blockMode,
  startSources,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !workspaceDivRef.current) {
      return;
    }
    const workspace = new MusicBlocklyWorkspace();
    workspace.init(
      workspaceDivRef.current,
      () => {},
      false,
      toolboxData,
      false,
      blockMode
    );

    const resizeObserver = new ResizeObserver(() => {
      workspace.resizeBlockly();
    });
    resizeObserver.observe(containerRef.current);

    if (startSources) {
      workspace.loadCode(startSources);
    }

    return () => {
      workspace.dispose();
      resizeObserver.disconnect();
    };
  }, [toolboxData, blockMode, startSources]);

  return (
    <div className={styles.previewWorkspaceContainer} ref={containerRef}>
      <div ref={workspaceDivRef} />
    </div>
  );
};

export default PreviewMusicWorkspace;
