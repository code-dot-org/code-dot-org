/* Thumbnail of the trained decision tree, drawn without text. */
import {IconButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import {useMemo} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import type {DisplayTreeNode} from '../helpers/displayTree';
import {
  edgePath,
  layoutDisplayTree,
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH,
} from '../helpers/displayTreeLayout';

import {leafColorClass} from './leafColors';

import styles from './treeMiniMap.module.scss';

const MINI_ROW_GAP = 32;
// In tree units, which the thumbnail scales down to a few pixels.
const NODE_CORNER_RADIUS = 12;
// Room for the half of each border that falls outside its node.
const VIEW_MARGIN = 8;

interface TreeMiniMapProps {
  tree: DisplayTreeNode;
  onReplay: () => void;
}

const TreeMiniMap = ({tree, onReplay}: TreeMiniMapProps) => {
  const layout = useMemo(() => layoutDisplayTree(tree, MINI_ROW_GAP), [tree]);

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
            width={TREE_NODE_WIDTH}
            height={TREE_NODE_HEIGHT}
            rx={NODE_CORNER_RADIUS}
            className={
              placed.answerIndex === undefined
                ? styles.question
                : classNames(styles.answer, leafColorClass(placed.answerIndex))
            }
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
