// What an animation says at the playhead, and the way to change it
// (SIMPLE_INTERFACE.md, "Animations"; specs/ANIMATION_PLAN.md, step 7).
//
// One field per property an animation moves: the picture, where it is
// drawn against the actor, its scale, its turn, how solid it is, and each
// of the actor's effects, on or off. Each shows its value at the playhead —
// a key's as it was set, and one worked out between two keys, or held from
// the last, in italics with which it is under it — and changing one writes a
// key there.
//
// BESIDE THE TIMELINE, not in the side panel the spec names. The side
// panel's fields are the actor's own properties, set once for every moment;
// these are a picture's, at one moment of one animation, and a field for
// each next to the strip it keys is the shorter way from one to the other.

import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import {spriteOf} from '../../appearance/paintTimeline';
import {isKeyAt, valueAt, type Timeline} from '../../engine/core/keyframes';
import fields from '../../formFields.module.css';

import styles from './actorEditor.module.css';

export interface MomentPanelProps {
  timeline: Timeline;
  /** Where the playhead is, in seconds. */
  time: number;
  /** The project's pictures an actor may wear, by file name. */
  pictures: readonly string[];
  /** The actor's effects: each one's path and what it is called. */
  effects: ReadonlyArray<{path: string; name: string}>;
  /** Set `property` to `value` at the playhead: a key there. */
  onSet: (property: string, value: unknown) => void;
  isReadOnly: boolean;
}

/** What a number field shows for a value: itself, rounded, or nothing. */
const shown = (value: number | undefined) =>
  value === undefined ? '' : String(Math.round(value * 100) / 100);

export const MomentPanel = ({
  timeline,
  time,
  pictures,
  effects,
  onSet,
  isReadOnly,
}: MomentPanelProps) => {
  const at = (property: string) =>
    valueAt(timeline.tracks[property] ?? [], time);
  /**
   * What to say of a value not keyed here: that it is worked out between
   * two keys, or held from the last one. Nothing for a key's own value, or
   * where the animation says nothing yet.
   */
  const unkeyed = (property: string) => {
    const track = timeline.tracks[property];
    if (!track?.length || at(property) === undefined || isKeyAt(track, time)) {
      return undefined;
    }
    return track.some(key => key.at > time)
      ? 'Between keys'
      : 'Held from the last key';
  };
  // What is being typed, committed on Enter or on leaving the field.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };

  const offset = at('drawnOffset') as {x: number; y: number} | undefined;
  const number = (
    id: string,
    label: string,
    held: number | undefined,
    placeholder: string,
    commit: (value: number) => void,
    property: string,
  ) => (
    <TextField
      key={id}
      name={`moment-${id}`}
      label={label}
      inputType="number"
      size="s"
      className={unkeyed(property) ? styles.interpolated : undefined}
      helperMessage={unkeyed(property)}
      placeholder={placeholder}
      value={draft[id] ?? shown(held)}
      disabled={isReadOnly}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setDraft(was => ({...was, [id]: event.target.value}))
      }
      onBlur={() => {
        const typed = draft[id];
        setDraft(was => {
          const rest = {...was};
          delete rest[id];
          return rest;
        });
        if (typed === undefined || typed.trim() === '') {
          return;
        }
        const value = Number(typed);
        if (Number.isFinite(value) && value !== held) {
          commit(value);
        }
      }}
      onKeyDown={blurOnEnter}
    />
  );

  const picture = spriteOf(at('sprite'));
  const pictureValue = picture
    ? picture.cell
      ? `${picture.file}@${picture.cell.x},${picture.cell.y}`
      : picture.file
    : '';
  return (
    <section
      className={`${styles.moment} ${fields.narrow}`}
      aria-label={`At ${Math.round(time * 10) / 10} seconds`}
    >
      <SimpleDropdown
        name="moment-sprite"
        labelText="Picture"
        size="s"
        disabled={isReadOnly}
        selectedValue={pictureValue}
        items={[
          // Nothing said: the actor's own picture, which the animation
          // leaves alone until its first picture key.
          ...(picture ? [] : [{value: '', text: '(as it is)'}]),
          ...pictures.map(file => ({value: file, text: file})),
          // One cell of a strip, which a whole picture is not.
          ...(picture?.cell
            ? [{value: pictureValue, text: `${picture.file} (one frame)`}]
            : []),
        ]}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          if (event.target.value && event.target.value !== pictureValue) {
            onSet('sprite', event.target.value);
          }
        }}
      />
      <div className={styles.momentPair}>
        {number(
          'offset-x',
          'Offset X',
          offset?.x,
          '0',
          x => onSet('drawnOffset', {x, y: offset?.y ?? 0}),
          'drawnOffset',
        )}
        {number(
          'offset-y',
          'Offset Y',
          offset?.y,
          '0',
          y => onSet('drawnOffset', {x: offset?.x ?? 0, y}),
          'drawnOffset',
        )}
      </div>
      {number(
        'scale',
        'Scale',
        at('drawnScale') as number | undefined,
        '1',
        value => onSet('drawnScale', value),
        'drawnScale',
      )}
      {number(
        'turn',
        'Turn',
        at('drawnTurn') as number | undefined,
        '0',
        value => onSet('drawnTurn', value),
        'drawnTurn',
      )}
      {number(
        'opacity',
        'Opacity',
        at('opacity') as number | undefined,
        '1',
        value => onSet('opacity', Math.max(0, Math.min(1, value))),
        'opacity',
      )}
      {effects.map(effect => (
        <Checkbox
          key={effect.path}
          name={`moment-effect-${effect.path}`}
          label={effect.name}
          checked={at(`effect:${effect.path}`) === true}
          disabled={isReadOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onSet(`effect:${effect.path}`, event.target.checked)
          }
        />
      ))}
    </section>
  );
};

export default MomentPanel;
