// The inspector for a LAYER: its name, how it moves with the camera, and its
// background (specs/LAYERS_PLAN.md). Something drawn in FRONT of the actors is
// a layer above them, with a background of its own.
//
// Shown when a layer is opened from the strip and no placement is selected.
// A factor is a multiplier per axis — `(1, 1)` moves with the view, `(0.2,
// 0)` is a sky that shifts as the player walks and stays put when they jump
// — and FIXED is not a factor of zero: a fixed layer does not consult the
// camera at all, which is what makes an interface layer one. Each slot is an
// image from the project's backgrounds, stretched over the map or tiled
// across it, and an offset.

import {Button, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';

import fields from '../formFields.module.css';

import {BackgroundField} from './BackgroundField';
import styles from './mapEditor.module.css';
import {layerName, type MapLayerDoc, type MapSlotDoc} from './mapModel';

export interface LayerInspectorProps {
  layer: MapLayerDoc;
  /** The project's backgrounds, by file name. */
  backgrounds: readonly string[];
  onChange: (change: Partial<Omit<MapLayerDoc, 'id'>>) => void;
  onBackground: (change: Partial<MapSlotDoc>) => void;
  onClose: () => void;
  isReadOnly: boolean;
}

const asNumber = (text: string, fallback: number): number => {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) ? value : fallback;
};

export const LayerInspector = ({
  layer,
  backgrounds,
  onChange,
  onBackground,
  onClose,
  isReadOnly,
}: LayerInspectorProps) => {
  // What is being typed, committed on blur or Enter; the parent re-keys this
  // when the layer changes from outside.
  const [draft, setDraft] = useState<Record<string, string>>({
    name: layer.name ?? '',
    px: String(layer.parallax?.x ?? 1),
    py: String(layer.parallax?.y ?? 1),
  });
  const type = (key: string) => (event: ChangeEvent<HTMLInputElement>) =>
    setDraft(held => ({...held, [key]: event.target.value}));
  const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };
  const commitParallax = () =>
    onChange({
      parallax: {x: asNumber(draft.px, 1), y: asNumber(draft.py, 1)},
    });
  // The one slot, named so its fields keep the names they had beside a
  // second one (`layer-background`, `layer-background-tiled`, …).
  const background = (
    <BackgroundField
      name="layer-background"
      slot={layer.background}
      backgrounds={backgrounds}
      onChange={onBackground}
      isReadOnly={isReadOnly}
    />
  );

  return (
    <div
      className={`${styles.inspector} ${fields.narrow}`}
      data-testid="layer-inspector"
    >
      <div className={styles.inspectorHead}>
        <Typography variant="subtitle2" component="span">
          Layer: {layerName(layer)}
        </Typography>
        <Button variant="text" size="extraSmall" onClick={onClose}>
          Close
        </Button>
      </div>
      <TextField
        name="layer-name"
        label="Name"
        size="s"
        value={draft.name}
        disabled={isReadOnly}
        onChange={type('name')}
        onBlur={() => onChange({name: draft.name.trim() || undefined})}
        onKeyDown={blurOnEnter}
      />
      <div className={styles.inspectorGrid}>
        <TextField
          name="layer-parallax-x"
          label="Moves X"
          inputType="number"
          size="s"
          value={draft.px}
          disabled={isReadOnly || Boolean(layer.fit)}
          onChange={type('px')}
          onBlur={commitParallax}
          onKeyDown={blurOnEnter}
        />
        <TextField
          name="layer-parallax-y"
          label="Moves Y"
          inputType="number"
          size="s"
          value={draft.py}
          disabled={isReadOnly || Boolean(layer.fit)}
          onChange={type('py')}
          onBlur={commitParallax}
          onKeyDown={blurOnEnter}
        />
      </div>
      <Checkbox
        name="layer-fixed"
        label="Fixed to the screen"
        checked={Boolean(layer.fit)}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange({fit: event.target.checked || undefined})
        }
      />
      {background}
    </div>
  );
};

export default LayerInspector;
