// The layer strip: the map's layers, front at the top (specs/LAYERS_PLAN.md).
//
// A layer is a depth slice of the map with a factor and two images, and the
// map editor is where one is made. The strip says which layers there are
// and which is SELECTED — the one a new placement lands on and the one the
// inspector shows when nothing is placed-and-selected. Front at the top,
// because that is how a stack reads; the document keeps them back to front,
// since that is the order they are drawn in.

import {Typography} from '@mui/material';

import {IconAction} from './IconAction';
import styles from './mapEditor.module.css';
import {DEFAULT_LAYER, layerName, type MapLayerDoc} from './mapModel';

export interface LayerPanelProps {
  /** Back to front, as the document holds them. */
  layers: readonly MapLayerDoc[];
  selected: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  /** +1 is nearer the front, −1 nearer the back. */
  onMove: (id: string, by: 1 | -1) => void;
  isReadOnly: boolean;
}

export const LayerPanel = ({
  layers,
  selected,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  isReadOnly,
}: LayerPanelProps) => {
  const at = layers.findIndex(layer => layer.id === selected);
  return (
    <div
      className={styles.layers}
      data-testid="layer-panel"
      data-callout="map.layers"
    >
      <Typography variant="subtitle2" component="span">
        Layers
      </Typography>
      <ul className={styles.layerList} aria-label="Layers, front first">
        {[...layers].reverse().map(layer => (
          <li key={layer.id}>
            <button
              type="button"
              className={styles.layerRow}
              aria-pressed={layer.id === selected}
              onClick={() => onSelect(layer.id)}
            >
              {layerName(layer)}
            </button>
          </li>
        ))}
      </ul>
      {/* Icons, named in words for a reader and a pointer's tooltip, as
          the inspector's actions are (`IconAction`). */}
      <div className={styles.layerActions}>
        <IconAction
          label="Add layer"
          icon="plus"
          onClick={onAdd}
          disabled={isReadOnly}
        />
        <IconAction
          label="Move layer forward"
          icon="arrow-up"
          onClick={() => onMove(selected, 1)}
          disabled={isReadOnly || at < 0 || at === layers.length - 1}
        />
        <IconAction
          label="Move layer back"
          icon="arrow-down"
          onClick={() => onMove(selected, -1)}
          disabled={isReadOnly || at <= 0}
        />
        <IconAction
          label="Remove layer"
          icon="trash"
          onClick={() => onRemove(selected)}
          // The default cannot go: an actor with no layer is on it.
          disabled={isReadOnly || selected === DEFAULT_LAYER}
        />
      </div>
    </div>
  );
};

export default LayerPanel;
