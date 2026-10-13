/* Thumbnail of the trained decision tree, drawn without text. */
import {IconButton, Tooltip} from '@mui/material';
import {useMemo} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {DisplayTreeNode} from '../helpers/displayTree';
import {
  edgePath,
  layoutDisplayTree,
  TREE_NODE_HEIGHT,
} from '../helpers/displayTreeLayout';
import {nodeWidthMeasurer} from '../helpers/displayTreeNodeContent';
import type {DisplayTreeCountsLookup} from '../helpers/displayTreeTrace';

import {leafColorStyle} from './leafColors';

import styles from './treeMiniMap.module.scss';

const MINI_ROW_GAP = 32;
// In tree units, which the thumbnail scales down to a few pixels.
const NODE_CORNER_RADIUS = 12;
// Room for the half of each border that falls outside its node.
const VIEW_MARGIN = 8;

interface TreeMiniMapProps {
  tree: DisplayTreeNode;
  datasetId: string;
  counts: DisplayTreeCountsLookup;
  onReplay: () => void;
}

const TreeMiniMap = ({tree, datasetId, counts, onReplay}: TreeMiniMapProps) => {
  const layout = useMemo(
    () =>
      layoutDisplayTree(
        tree,
        nodeWidthMeasurer(datasetId, counts),
        MINI_ROW_GAP,
      ),
    [tree, datasetId, counts],
  );

  return (
    <div className={styles.miniMap}>
      <svg
        className={styles.tree}
        viewBox={[
          -VIEW_MARGIN,
          -VIEW_MARGIN,
          layout.width + 2 * VIEW_MARGIN,
          layout.height + 2 * VIEW_MARGIN,
        ].join(' ')}
        aria-hidden="true"
      >
        {layout.nodes.map(
          placed =>
            placed.parent && (
              <path
                key={placed.id}
                d={edgePath(placed.parent, placed, MINI_ROW_GAP / 2)}
                className={styles.edge}
              />
            ),
        )}
        {layout.nodes.map(placed => (
          <rect
            key={placed.id}
            x={placed.x}
            y={placed.y}
            width={placed.width}
            height={TREE_NODE_HEIGHT}
            rx={NODE_CORNER_RADIUS}
            {...(placed.answerIndex === undefined
              ? {className: styles.question}
              : {
                  className: styles.answer,
                  style: leafColorStyle(placed.answerIndex),
                })}
          />
        ))}
      </svg>
      <Tooltip title="Replay training">
        <IconButton
          aria-label="Replay training"
          onClick={onReplay}
          size="extraSmall"
          color="secondary"
          variant="outlined"
          className={styles.replayButton}
        >
          <FontAwesomeV6Icon iconName="play" aria-hidden="true" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default TreeMiniMap;
