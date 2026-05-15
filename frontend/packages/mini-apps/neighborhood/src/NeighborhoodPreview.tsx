import {useContext, useEffect, useRef} from 'react';

import {NEIGHBORHOOD_NAME} from './constants';
import {NeighborhoodInputsContext} from './NeighborhoodInputsContext';
import type {NeighborhoodMiniApp} from './NeighborhoodMiniApp';
import NeighborhoodVisualization from './NeighborhoodVisualization';

/**
 * Package-side `PreviewComponent` codebridge mounts inside its preview
 * panel. Reads orchestration inputs (mini-app instance, level
 * properties, skin, serialized maze) from `NeighborhoodInputsContext`
 * and, once all four are present, boots the inner Neighborhood by
 * calling `miniApp.afterInject(...)`. Renders the visualization
 * unconditionally — without a provider (e.g. in the package's own dev
 * server) the boot is skipped, but the SVG and slider still render so
 * the component is usable in isolation.
 */
const NeighborhoodPreview = () => {
  const inputs = useContext(NeighborhoodInputsContext);
  // Tracks the last `(miniApp, bootKey)` pair we booted with, so parent
  // re-renders that churn the inputs-object reference don't trigger
  // redundant `afterInject` calls. Re-boot only when either the
  // mini-app instance is different (level switched and codebridge
  // handed us a fresh MiniApp) or the boot key changes (different
  // level id or different serialized maze contents).
  const lastBootedRef = useRef<{
    miniApp: NeighborhoodMiniApp;
    key: string;
  } | null>(null);

  useEffect(() => {
    if (!inputs) return;
    const {miniApp, levelProperties, skin, serializedMaze} = inputs;
    if (!miniApp || !levelProperties || !skin || !serializedMaze) return;

    const levelId = (levelProperties as {id?: unknown}).id;
    const bootKey = `${String(levelId)}|${serializedMaze}`;
    if (
      lastBootedRef.current?.miniApp === miniApp &&
      lastBootedRef.current.key === bootKey
    ) {
      return;
    }

    let mazeContents: unknown;
    try {
      mazeContents = JSON.parse(serializedMaze);
    } catch (error) {
      // The level emits the serialized maze; a parse failure is a
      // protocol-shape regression rather than user-recoverable, so we
      // log loudly and skip the boot rather than feeding partial data
      // into MazeController. Leave `lastBootedRef` untouched so a
      // corrected re-render still re-attempts the boot.
      console.error('Failed to parse serialized maze:', error);
      return;
    }

    const parsedLevelProperties = {
      ...(levelProperties as object),
      serializedMaze: mazeContents,
    };

    miniApp.afterInject(
      parsedLevelProperties,
      skin,
      {
        skinId: NEIGHBORHOOD_NAME,
        level: parsedLevelProperties,
        skin,
      },
      () => {},
      () => {},
      () => {},
      () => {},
    );

    lastBootedRef.current = {miniApp, key: bootKey};
  }, [inputs]);

  return <NeighborhoodVisualization />;
};

export default NeighborhoodPreview;
