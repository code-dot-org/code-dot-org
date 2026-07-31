import {
  Button,
  IconButton,
  List,
  ListItemButton,
  ListSubheader,
  TextField,
} from '@mui/material';
import {useMemo, useState} from 'react';

import {translate} from '../localization';
import {functionIdFromNodeType} from '../model/constants';
import type {EffectNodeRegistry} from '../nodes/registry';
import type {EffectNodeCategory, EffectNodeDefinition} from '../nodes/types';

import {nodeDisplayDescription, nodeDisplayLabel} from './labels';
import styles from './NodePalette.module.css';

/**
 * Drag payload type for palette items. The canvas accepts drops carrying this
 * and reads the node type out of it.
 */
export const NODE_DRAG_MIME = 'application/x-effect-node';

const CATEGORY_LABELS: Record<EffectNodeCategory, string> = {
  io: 'Input & Output',
  math: 'Math',
  vector: 'Values',
  texture: 'Texture',
  color: 'Color',
  utility: 'Utility',
  function: 'Your Functions',
};

export interface NodePaletteProps {
  registry: EffectNodeRegistry;
  onAddNode: (type: string) => void;
  /** Open a function's workspace. Rendered as a ✎ on function entries. */
  onEditFunction?: (functionId: string) => void;
  /** Create a new function and open it. Renders the "+ New function" button. */
  onCreateFunction?: () => void;
}

/** The list of nodes a learner can drop into the workspace. */
export function NodePalette({
  registry,
  onAddNode,
  onEditFunction,
  onCreateFunction,
}: NodePaletteProps) {
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = registry
      .list()
      .filter(
        definition =>
          term.length === 0 ||
          nodeDisplayLabel(definition).toLowerCase().includes(term) ||
          definition.label.toLowerCase().includes(term) ||
          nodeDisplayDescription(definition).toLowerCase().includes(term),
      );

    const byCategory = new Map<EffectNodeCategory, EffectNodeDefinition[]>();
    for (const definition of matches) {
      const bucket = byCategory.get(definition.category) ?? [];
      bucket.push(definition);
      byCategory.set(definition.category, bucket);
    }
    return [...byCategory.entries()];
  }, [registry, query]);

  return (
    <aside className={styles.palette} aria-label={translate('Node palette')}>
      <TextField
        type="search"
        className={styles.search}
        placeholder={translate('Search nodes')}
        slotProps={{htmlInput: {'aria-label': translate('Search nodes')}}}
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      {grouped.map(([category, definitions]) => (
        <List
          key={category}
          dense
          disablePadding
          className={styles.group}
          subheader={
            <ListSubheader disableGutters component="div">
              {translate(CATEGORY_LABELS[category])}
            </ListSubheader>
          }
        >
          {definitions.map(definition => {
            const functionId = functionIdFromNodeType(definition.type);
            return (
              <li key={definition.type} className={styles.itemRow}>
                <ListItemButton
                  className={styles.item}
                  title={nodeDisplayDescription(definition)}
                  // Click drops the node mid-view; dragging places it exactly.
                  draggable
                  onDragStart={event => {
                    event.dataTransfer.setData(NODE_DRAG_MIME, definition.type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => onAddNode(definition.type)}
                >
                  {nodeDisplayLabel(definition)}
                </ListItemButton>
                {functionId !== null && onEditFunction && (
                  <IconButton
                    className={styles.editFunction}
                    aria-label={translate('Open function {name}', {
                      name: definition.label,
                    })}
                    title={translate("Open this function's workspace")}
                    onClick={() => onEditFunction(functionId)}
                  >
                    ✎
                  </IconButton>
                )}
              </li>
            );
          })}
        </List>
      ))}

      {grouped.length === 0 && (
        <p className={styles.empty}>
          {translate('No nodes match “{query}”.', {query})}
        </p>
      )}

      {onCreateFunction && (
        <Button
          fullWidth
          className={styles.newFunction}
          title={translate(
            'Build a reusable node from its own workspace of nodes',
          )}
          onClick={onCreateFunction}
        >
          {translate('+ New function')}
        </Button>
      )}
    </aside>
  );
}
