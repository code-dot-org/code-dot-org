import React from 'react';

import ShareButtonPanel from '@cdo/apps/lab2/views/components/layout/ShareButtonPanel';

import ReactFlowCanvas, {ReactFlowCanvasProps} from './components/ReactFlowCanvas';

import shareStyles from '@cdo/apps/lab2/views/components/layout/share-layout.module.scss';

type ShareViewProps = Pick<
  ReactFlowCanvasProps,
  'levelName' | 'initialNodes' | 'initialEdges' | 'initialViewport' | 'colorMode'
>;

/**
 * Read-only view of a shared Sketch Lab project: the standard share sidebar
 * next to the sketch canvas. The instructions/resource panel is omitted.
 */
const ShareView: React.FunctionComponent<ShareViewProps> = props => {
  return (
    <div className={shareStyles.shareContainer}>
      <ShareButtonPanel />
      <div className={shareStyles.previewContainer}>
        <ReactFlowCanvas {...props} readOnly updateSources={() => {}} />
      </div>
    </div>
  );
};

export default ShareView;
