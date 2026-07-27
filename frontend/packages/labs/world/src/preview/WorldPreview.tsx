import {useEffect, useRef} from 'react';

import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './worldPreview.module.css';

/**
 * The World Lab preview pane: it mounts the sandbox's preview iframe (the game
 * canvas). The iframe itself is owned by the runtime's `WorldPreviewManager`
 * (which drives it via postMessage); this component only places it in the pane.
 *
 * If no sandbox origin is configured, student code cannot run on the lab's own
 * origin, so we say so rather than render anything (SANDBOX.md). Pass one with
 * `?world-sandbox=` (the standalone demo defaults it to the `dev:sandbox` port).
 */
export const WorldPreview = () => {
  const {isConfigured, previewIframe} = useWorldRuntime();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !previewIframe) {
      return;
    }
    previewIframe.style.width = '100%';
    previewIframe.style.height = '100%';
    previewIframe.style.border = '0';
    previewIframe.style.display = 'block';
    container.appendChild(previewIframe);
    return () => {
      if (previewIframe.parentElement === container) {
        container.removeChild(previewIframe);
      }
    };
  }, [previewIframe]);

  if (!isConfigured) {
    return (
      <div className={styles.notConfigured}>
        No sandbox origin is configured. Your game runs on its own origin so it
        cannot reach this page&apos;s session — pass one with{' '}
        <code>?world-sandbox=…</code> (see the README).
      </div>
    );
  }

  return <div ref={containerRef} className={styles.frame} />;
};

export default WorldPreview;
