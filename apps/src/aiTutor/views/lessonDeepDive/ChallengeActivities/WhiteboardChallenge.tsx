import {
  ThemeProvider,
  useTheme,
} from '@code-dot-org/component-library/common/contexts';
import {ReactFlowProvider} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {FC, useEffect, useState} from 'react';

import ReactFlowCanvas from '@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas';
import {ReactFlowSketchLabSources} from '@cdo/apps/sketchlab/reactFlow/types';

import videoChallengeStyles from './video-challenge.module.scss';
import styles from './whiteboard-challenge.module.scss';

const DEFAULT_SOURCES: ReactFlowSketchLabSources = {
  source: {nodes: [], edges: []},
};

// The canvas's element toolbars read the component-library ThemeContext,
// which lab2 provides at its app root but the Tutor+ page does not. The
// provider defaults to Light and takes no initial value, so force Dark to
// match the deep dive UI.
const ForceDarkTheme: FC = () => {
  const {theme, setTheme} = useTheme();
  useEffect(() => {
    if (theme !== 'Dark') {
      setTheme('Dark');
    }
  }, [theme, setTheme]);
  return null;
};

interface WhiteboardChallengeProps {
  submitted: boolean;
  submitCallback: React.Dispatch<React.SetStateAction<boolean>>;
}

const WhiteboardChallenge: FC<WhiteboardChallengeProps> = ({
  submitted,
  submitCallback,
}) => {
  // ReactFlowCanvas reports edits through the same updateSources contract
  // as sketchlab's SourcesContainer; here the drawing lives in local state
  // only. It is not persisted anywhere yet.
  const [sources, setSources] =
    useState<ReactFlowSketchLabSources>(DEFAULT_SOURCES);

  const canSubmit = !submitted && sources.source.nodes.length > 0;

  const handleSubmit = () => {
    submitCallback(true);
  };

  return (
    <div>
      <ThemeProvider>
        <ForceDarkTheme />
        <div className={styles.whiteboardPane}>
          <ReactFlowProvider>
            <ReactFlowCanvas
              updateSources={setSources}
              levelName="aiTutorChallenge"
              initialNodes={[]}
              initialEdges={[]}
              initialViewport={undefined}
              colorMode="dark"
              readOnly={submitted}
            />
          </ReactFlowProvider>
        </div>
      </ThemeProvider>
      <button
        type="button"
        className={videoChallengeStyles.submitButton}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default WhiteboardChallenge;
