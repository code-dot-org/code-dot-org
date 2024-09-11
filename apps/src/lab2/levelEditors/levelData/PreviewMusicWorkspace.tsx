import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import MusicBlocklyWorkspace from '@cdo/apps/music/blockly/MusicBlocklyWorkspace';
import {ToolboxData} from '@cdo/apps/music/blockly/toolbox/types';
import {BlockMode} from '@cdo/apps/music/constants';
import {ValueOf} from '@cdo/apps/types/utils';

import PanelContainer from '../../views/components/PanelContainer';

import styles from './edit-music-level-data.module.scss';

interface PreviewMusicWorkspaceProps {
  toolboxData?: ToolboxData;
  blockMode: ValueOf<typeof BlockMode>;
}

const PreviewMusicWorkspace: React.FC<PreviewMusicWorkspaceProps> = ({
  toolboxData,
  blockMode,
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

    return () => {
      workspace.dispose();
      resizeObserver.disconnect();
    };
  }, [toolboxData, blockMode]);

  return (
    <div
      className={classNames(
        styles.verticalFlex,
        styles.gapMedium,
        styles.previewWorkspaceContainer
      )}
      ref={containerRef}
    >
      <Alert
        text="
        The workspace below is not functional and is just for toolbox
        demonstration purposes. Blocks added to the workspace, and changes made
        to field values on blocks within the flyout will not be saved."
        type="info"
        size="xs"
      />
      <PanelContainer id="preview-workspace" headerContent="Preview">
        <div ref={workspaceDivRef} />
      </PanelContainer>
    </div>
  );
};

export default PreviewMusicWorkspace;
