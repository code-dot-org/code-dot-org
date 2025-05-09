import {SplitPane} from '@rexxars/react-split-pane';
import React, {ReactNode, PropsWithChildren} from 'react';

import type {TabModel} from '@code-dot-org/component-library/tabs';

import Information from './information';

import moduleStyles from './workspace.module.scss';

export interface WorkspaceProps extends PropsWithChildren {
  outputPane: ReactNode;
  tabs: TabModel[];
}

/**
 * Represents the generic coding workspace for a level.
 */
const Workspace: React.FunctionComponent<WorkspaceProps> = ({
  outputPane,
  tabs,
  children,
}) => {
  return (
    <div className={moduleStyles.workspaceContainer}>
      <SplitPane
        split="vertical"
        defaultSize={400}
        allowResize
        style={{position: 'relative'}}
        paneStyle={{
          overflow: 'hidden',
          position: 'relative',
        }}
        resizerStyle={{
          width: '0.375rem',
          cursor: 'ew-resize',
          backgroundColor: 'var(--borders-neutral-primary)',
          borderLeft: '0.0625rem solid var(--borders-brand-purple-light)',
        }}
      >
        {outputPane}
        <SplitPane
          split="horizontal"
          defaultSize={200}
          allowResize
          style={{position: 'relative'}}
          paneStyle={{
            overflow: 'hidden',
            position: 'relative',
            borderLeft: '0.0625rem solid var(--borders-brand-purple-light)',
          }}
          resizerStyle={{
            height: '0.375rem',
            cursor: 'ns-resize',
            backgroundColor: 'var(--borders-neutral-primary)',
            borderTop: '0.0625rem solid var(--borders-brand-purple-light)',
            borderBottom: '0.0625rem solid var(--borders-brand-purple-light)',
          }}
        >
          <Information tabs={tabs} />
          {children}
        </SplitPane>
      </SplitPane>
    </div>
  );
};

export default Workspace;
