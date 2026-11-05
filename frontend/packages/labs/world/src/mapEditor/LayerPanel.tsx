// The layer strip: the map's layers, front at the top (specs/LAYERS_PLAN.md).
//
// A layer is a depth slice of the map with a factor and two images, and the
// map editor is where one is made. The strip says which layers there are
// and which is SELECTED — the one a new placement lands on and the one the
// inspector shows when nothing is placed-and-selected. Front at the top,
// because that is how a stack reads; the document keeps them back to front,
// since that is the order they are drawn in.

import {Typography} from '@mui/material';
import type {ChangeEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';

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
  /**
   * Whether the layers in front of the selected one are drawn. While the
   * strip is open they are not, so they do not cover the one being edited.
   */
  showAll: boolean;
  onShowAll: (shown: boolean) => void;
  isReadOnly: boolean;
}

export const LayerPanel = ({
  layers,
  selected,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  showAll,
  onShowAll,
  isReadOnly,
}: LayerPanelProps) => {
  const at = layers.findIndex(layer => layer.id === selected);
  /** What the stage leaves undrawn: what is in front of the selected one. */
  const inFront = at < 0 ? 0 : layers.length - 1 - at;
  const layersWord = (count: number) =>
    `${count} layer${count === 1 ? '' : 's'}`;
  // Said on a press or a tick, not on every change the strip is shown.
  const [said, setSaid] = useState('');
  const pressed = (layer: MapLayerDoc, index: number) => {
    const hides = showAll ? 0 : layers.length - 1 - index;
    setSaid(
      hides
        ? `${layersWord(hides)} in front of ${layerName(layer)} hidden; ` +
            `Show all layers brings ${hides === 1 ? 'it' : 'them'} back`
        : '',
    );
    onSelect(layer.id);
  };
  return (
    <div
      className={styles.layers}
      data-testid="layer-panel"
      data-callout="map.layers"
    >
      <Typography variant="subtitle2" component="span">
        Layers
      </Typography>
      <Typography
        variant="body4"
        component="span"
        className={styles.inspectorNote}
      >
        Click a layer to give it a background.
      </Typography>
      <ul className={styles.layerList} aria-label="Layers, front first">
        {layers
          .map((layer, index) => ({layer, index}))
          .reverse()
          .map(({layer, index}) => (
            <li key={layer.id}>
              <button
                type="button"
                className={styles.layerRow}
                aria-pressed={layer.id === selected}
                onClick={() => pressed(layer, index)}
              >
                {layerName(layer)}
              </button>
            </li>
          ))}
      </ul>
      {/* Front first, so what is hidden is what is above the pressed row. */}
      <Checkbox
        name="layers-show-all"
        size="s"
        label={
          inFront && !showAll
            ? `Show all layers (${layersWord(inFront)} hidden)`
            : 'Show all layers'
        }
        checked={showAll}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const shown = event.target.checked;
          setSaid(
            inFront
              ? `${layersWord(inFront)} ${shown ? 'shown' : 'hidden'}`
              : '',
          );
          onShowAll(shown);
        }}
      />
      <span className={styles.announcer} role="status">
        {said}
      </span>
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
