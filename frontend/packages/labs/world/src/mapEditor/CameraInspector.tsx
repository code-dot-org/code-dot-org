// The inspector for one of the world's cameras (specs/SPACE_CAMERAS_PLAN.md,
// step 9c): its name, whether the world starts looking through it, the
// camera traits it elects, and a field per property of each — `actor to
// follow`, `look offset` — which is what a placement's inspector does for an
// actor's traits.
//
// Every field is a row of the camera's `define camera` in the world's code,
// read and written by `worldCameraEdits`, so what this shows and what the
// blocks say are one thing.
//
// The main camera has no traits of its own here: every world has it, and it
// shows the map from its top left. Following something is what an added
// camera is for, looked through from the start.

import {Button, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import {requestRulesConfig} from '../blockly/rulesConfig';
import fields from '../formFields.module.css';

import styles from './mapEditor.module.css';
import {MAIN_CAMERA, type CameraProperty} from './worldCameraEdits';
import {parseVectorText, vectorText} from './worldProperties';
import type {CameraTraitChoice} from './worldRuleProperties';

export interface CameraInspectorProps {
  /** The camera's block id, or `MAIN_CAMERA`. */
  id: string;
  name: string;
  /** Whether the world starts looking through it. */
  starting: boolean;
  /** The trait values it elects. */
  traits: readonly string[];
  /** The traits the project's rules offer a camera. */
  choices: readonly CameraTraitChoice[];
  /** What it sets a property to, as `worldCameraEdits` reads it. */
  valueOf: (property: CameraProperty) => string | undefined;
  /** The project's actor kinds, as `[name, module path]`. */
  kinds: ReadonlyArray<readonly [string, string]>;
  onRename: (name: string) => void;
  onStarting: () => void;
  onTrait: (trait: string, elected: boolean) => void;
  onValue: (property: CameraProperty, value: string) => void;
  onClose: () => void;
  isReadOnly: boolean;
}

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

export const CameraInspector = ({
  id,
  name,
  starting,
  traits,
  choices,
  valueOf,
  kinds,
  onRename,
  onStarting,
  onTrait,
  onValue,
  onClose,
  isReadOnly,
}: CameraInspectorProps) => {
  const main = id === MAIN_CAMERA;
  // What is being typed, committed on blur or Enter; the parent re-keys this
  // when the camera changes from outside.
  const [draft, setDraft] = useState<Record<string, string>>({name});
  const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };
  const elected = choices.filter(choice => traits.includes(choice.value));

  const renderField = (property: CameraProperty) => {
    const key = property.setter;
    const label = capitalize(property.name);
    const held = valueOf(property);
    if (property.type === 'actor') {
      // A KIND: `any ⟨Bird⟩`, the first of them, as the blocks say it.
      return (
        <SimpleDropdown
          key={key}
          name={`camera-${key}`}
          labelText={label}
          size="s"
          className={styles.inspectorDropdown}
          disabled={isReadOnly}
          selectedValue={held ?? ''}
          items={[
            {value: '', text: '(nobody)'},
            ...kinds.map(([kindName, path]) => ({
              value: path,
              text: `any ${kindName}`,
            })),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onValue(property, event.target.value)
          }
        />
      );
    }
    if (property.type === 'boolean') {
      return (
        <Checkbox
          key={key}
          name={`camera-${key}`}
          label={label}
          checked={held === 'true'}
          disabled={isReadOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onValue(property, event.target.checked ? 'true' : 'false')
          }
        />
      );
    }
    if (property.type === 'point' || property.type === 'vector') {
      const at = parseVectorText(held ?? '') ?? {x: 0, y: 0};
      return (
        <div key={key} className={styles.inspectorGrid}>
          {(['x', 'y'] as const).map(axis => (
            <TextField
              key={axis}
              name={`camera-${key}-${axis}`}
              label={`${label} ${axis.toUpperCase()}`}
              inputType="number"
              size="s"
              value={draft[`${key}.${axis}`] ?? String(at[axis])}
              disabled={isReadOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraft(was => ({
                  ...was,
                  [`${key}.${axis}`]: event.target.value,
                }))
              }
              onBlur={() => {
                const typed = Number(draft[`${key}.${axis}`]);
                if (Number.isFinite(typed) && typed !== at[axis]) {
                  onValue(property, vectorText({...at, [axis]: typed}));
                }
              }}
              onKeyDown={blurOnEnter}
            />
          ))}
        </div>
      );
    }
    return (
      <TextField
        key={key}
        name={`camera-${key}`}
        label={label}
        inputType={property.type === 'number' ? 'number' : 'text'}
        size="s"
        value={draft[key] ?? held ?? ''}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setDraft(was => ({...was, [key]: event.target.value}))
        }
        onBlur={() => {
          const typed = draft[key];
          if (typed !== undefined && typed !== held) {
            onValue(property, typed);
          }
        }}
        onKeyDown={blurOnEnter}
      />
    );
  };

  return (
    <div
      className={`${styles.inspector} ${fields.narrow}`}
      data-testid="camera-inspector"
    >
      <div className={styles.inspectorHead}>
        <Typography variant="subtitle2" component="span">
          Camera: {main ? 'Main camera' : name}
        </Typography>
        <Button variant="text" size="extraSmall" onClick={onClose}>
          Close
        </Button>
      </div>
      {!main && (
        <TextField
          name="camera-name"
          label="Name"
          size="s"
          value={draft.name}
          disabled={isReadOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft(was => ({...was, name: event.target.value}))
          }
          onBlur={() => {
            const next = draft.name.trim();
            if (next && next !== name) {
              onRename(next);
            } else {
              setDraft(was => ({...was, name}));
            }
          }}
          onKeyDown={blurOnEnter}
        />
      )}
      <Checkbox
        name="camera-starting"
        label="The world starts looking through this camera"
        checked={starting}
        // Unticking means another camera, and which one is said by ticking
        // that one: the box only ever turns ON.
        disabled={isReadOnly || starting}
        onChange={() => onStarting()}
      />
      {main ? (
        <Typography
          variant="body3"
          component="span"
          className={styles.inspectorNote}
        >
          Every world has this camera. It shows the map from its top left. To
          follow something, add a camera and give it a trait.
        </Typography>
      ) : choices.length === 0 ? (
        <>
          <Typography
            variant="body3"
            component="span"
            className={styles.inspectorNote}
          >
            A camera does more with a camera rule, like Camera Follow. Add one
            to the world's rules.
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => void requestRulesConfig({editable: !isReadOnly})}
          >
            Rules…
          </Button>
        </>
      ) : (
        <div className={styles.inspectorGroup}>
          {choices.map(choice => (
            <Checkbox
              key={choice.value}
              name={`camera-trait-${choice.value}`}
              label={choice.name}
              checked={traits.includes(choice.value)}
              disabled={isReadOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onTrait(choice.value, event.target.checked)
              }
            />
          ))}
        </div>
      )}
      {!main && elected.flatMap(choice => choice.properties).map(renderField)}
    </div>
  );
};

export default CameraInspector;
