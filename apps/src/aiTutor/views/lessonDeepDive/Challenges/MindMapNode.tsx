import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

import styles from './curious-activity.module.scss';

export interface MindMapNodeData {
  id: string;
  label: string;
  // 'concept' nodes expand into more branches; 'fact' nodes are terminal and
  // carry a cited source.
  kind: 'concept' | 'fact';
  children: MindMapNodeData[];
  // Whether this node's branches have been generated yet.
  generated: boolean;
  loading: boolean;
  error: boolean;
  // Whether generated children are hidden.
  collapsed: boolean;
  // The root node is styled and labeled differently (it is the seed concept).
  isRoot?: boolean;
  // For 'fact' nodes: the cited source of the fact.
  source?: string;
}

interface MindMapNodeProps {
  node: MindMapNodeData;
  onToggle: (id: string) => void;
}

// Renders one mind-map node and, when expanded, its children to the right with
// connector guides. Recurses for the whole subtree.
const MindMapNode: FC<MindMapNodeProps> = ({node, onToggle}) => {
  // Fact nodes are terminal: a non-interactive card with the fact and its source.
  if (node.kind === 'fact') {
    return (
      <div className={styles.nodeRow}>
        <div className={styles.factNode}>
          <span className={styles.factIcon}>
            <FontAwesomeV6Icon iconName="lightbulb" />
          </span>
          <span className={styles.factBody}>
            <span className={styles.factText}>{node.label}</span>
            {node.source && (
              <span className={styles.factSource}>Source: {node.source}</span>
            )}
          </span>
        </div>
      </div>
    );
  }

  const showChildren =
    node.generated && !node.collapsed && node.children.length > 0;

  const indicator = node.loading
    ? 'spinner'
    : node.error
      ? 'rotate-right'
      : !node.generated
        ? 'plus'
        : node.collapsed
          ? 'plus'
          : 'minus';

  return (
    <div className={styles.nodeRow}>
      <button
        type="button"
        className={`${styles.node} ${node.isRoot ? styles.rootNode : ''}`}
        onClick={() => onToggle(node.id)}
        disabled={node.loading}
        aria-expanded={node.generated ? !node.collapsed : undefined}
        title={
          node.error
            ? 'Something went wrong — click to try again'
            : !node.generated
              ? 'Explore this branch'
              : undefined
        }
      >
        <span className={styles.nodeLabel}>{node.label}</span>
        <span
          className={`${styles.nodeIndicator} ${
            indicator === 'spinner' ? styles.spin : ''
          }`}
        >
          <FontAwesomeV6Icon
            iconName={indicator === 'spinner' ? 'spinner' : indicator}
          />
        </span>
      </button>

      {showChildren && (
        <div className={styles.children}>
          {node.children.map(child => (
            <MindMapNode key={child.id} node={child} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MindMapNode;
