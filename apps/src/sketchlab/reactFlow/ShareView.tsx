import React, {useCallback} from 'react';

import ShareButtonPanel from '@cdo/apps/lab2/views/components/layout/ShareButtonPanel';

import ReactFlowCanvas, {
  ReactFlowCanvasProps,
} from './components/ReactFlowCanvas';

import shareStyles from '@cdo/apps/lab2/views/components/layout/share-layout.module.scss';

type ShareViewProps = Pick<
  ReactFlowCanvasProps,
  'initialNodes' | 'initialEdges' | 'initialViewport' | 'colorMode'
>;

/**
 * Read-only view of a shared Sketch Lab project: the standard share sidebar
 * next to the sketch canvas. The instructions/resource panel is omitted.
 */
const ShareView: React.FunctionComponent<ShareViewProps> = props => {
  const noOpUpdateSources = useCallback(() => {}, []);
  return (
    <div className={shareStyles.shareContainer}>
      <ShareButtonPanel hideViewCode />
      <div className={shareStyles.previewContainer}>
        <ReactFlowCanvas
          {...props}
          readOnly
          updateSources={noOpUpdateSources}
        />
      </div>
    </div>
  );
};

export default ShareView;
