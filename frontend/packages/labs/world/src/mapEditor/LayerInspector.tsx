// The inspector for a LAYER: its name, how it moves with the camera, and its
// two images (specs/LAYERS_PLAN.md; VIEWPORT.md, "A layer's background and
// foreground").
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
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import styles from './mapEditor.module.css';
import {layerName, type MapLayerDoc, type MapSlotDoc} from './mapModel';

export interface LayerInspectorProps {
  layer: MapLayerDoc;
  /** The project's backgrounds, by file name. */
  backgrounds: readonly string[];
  onChange: (change: Partial<Omit<MapLayerDoc, 'id'>>) => void;
  onSlot: (
    which: 'background' | 'foreground',
    change: Partial<MapSlotDoc>,
  ) => void;
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
  onSlot,
  onClose,
  isReadOnly,
}: LayerInspectorProps) => {
  // What is being typed, committed on blur or Enter; the parent re-keys this
  // when the layer changes from outside.
  const [draft, setDraft] = useState<Record<string, string>>({
    name: layer.name ?? '',
    px: String(layer.parallax?.x ?? 1),
    py: String(layer.parallax?.y ?? 1),
    'background.x': String(layer.background?.offset?.x ?? 0),
    'background.y': String(layer.background?.offset?.y ?? 0),
    'foreground.x': String(layer.foreground?.offset?.x ?? 0),
    'foreground.y': String(layer.foreground?.offset?.y ?? 0),
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
  const commitOffset = (which: 'background' | 'foreground') =>
    onSlot(which, {
      offset: {
        x: asNumber(draft[`${which}.x`], 0),
        y: asNumber(draft[`${which}.y`], 0),
      },
    });

  const slot = (which: 'background' | 'foreground', title: string) => (
    <div className={styles.inspectorGroup}>
      <SimpleDropdown
        name={`layer-${which}`}
        labelText={title}
        size="s"
        className={styles.inspectorDropdown}
        disabled={isReadOnly}
        selectedValue={layer[which]?.sprite ?? ''}
        items={[
          {value: '', text: '(none)'},
          ...backgrounds.map(name => ({value: name, text: name})),
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onSlot(which, {sprite: event.target.value})
        }
      />
      <Checkbox
        name={`layer-${which}-tiled`}
        label="Tiled"
        checked={Boolean(layer[which]?.repeat)}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onSlot(which, {repeat: event.target.checked})
        }
      />
      <div className={styles.inspectorGrid}>
        {(['x', 'y'] as const).map(axis => (
          <TextField
            key={axis}
            name={`layer-${which}-${axis}`}
            label={`Slide ${axis.toUpperCase()}`}
            inputType="number"
            size="s"
            value={draft[`${which}.${axis}`]}
            disabled={isReadOnly}
            onChange={type(`${which}.${axis}`)}
            onBlur={() => commitOffset(which)}
            onKeyDown={blurOnEnter}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.inspector} data-testid="layer-inspector">
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
      {slot('background', 'Background')}
      {slot('foreground', 'Foreground')}
    </div>
  );
};

export default LayerInspector;
