// The inspector for a Viewport's one camera (specs/SPACE_CAMERAS_PLAN.md,
// specs/ONE_WORLD_PLAN.md), opened from the Viewport's own inspector and
// closed back to it: its zoom, the camera traits it elects, and a field per
// property of each — `actor to follow`, `look offset` — which is what a
// placement's inspector does for an actor's traits.
//
// What it shows and writes is data kept on the Viewport's placement, which
// the compiler turns into a `setViewportCamera` call
// (`blockly/placementCameras`).

import {Button, Typography} from '@mui/material';
import type {ChangeEvent, KeyboardEvent} from 'react';
import {useState} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import {CheckboxDropdown} from '@code-dot-org/component-library/dropdown';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import {requestCameraRuleImport} from '../blockly/ruleImport';
import fields from '../formFields.module.css';

import styles from './mapEditor.module.css';
import {useAfterImport} from './useAfterImport';
import type {CameraProperty} from './worldCameraCode';
import {parseVectorText, vectorText} from './worldProperties';
import type {CameraTraitChoice} from './worldRuleProperties';

export interface CameraInspectorProps {
  /** The trait values it elects. */
  traits: readonly string[];
  /** The traits the project's rules offer a camera. */
  choices: readonly CameraTraitChoice[];
  /** What it sets a property to, as `worldCameraCode` reads it. */
  valueOf: (property: CameraProperty) => string | undefined;
  /** The project's actor kinds, as `[name, module path]`. */
  kinds: ReadonlyArray<readonly [string, string]>;
  onTrait: (trait: string, elected: boolean) => void;
  onValue: (property: CameraProperty, value: string) => void;
  /** How much it magnifies (`Camera.zoom`). */
  zoom?: number;
  onZoom: (zoom: number) => void;
  onClose: () => void;
  isReadOnly: boolean;
}

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

export const CameraInspector = ({
  traits,
  choices,
  valueOf,
  kinds,
  onTrait,
  onValue,
  zoom = 1,
  onZoom,
  onClose,
  isReadOnly,
}: CameraInspectorProps) => {
  // What is being typed, committed on blur or Enter; the parent re-keys this
  // when the camera changes from outside.
  const [draft, setDraft] = useState<Record<string, string>>({
    zoom: String(zoom),
  });
  const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };
  const elected = choices.filter(choice => traits.includes(choice.value));
  // An imported rule is ticked once its traits are among the choices — the
  // render that has the new project (`useAfterImport`).
  const importRuleThen = useAfterImport(
    choices.map(choice => choice.rule),
    rule => {
      const brought = choices.find(choice => choice.rule === rule);
      if (brought && !traits.includes(brought.value)) {
        onTrait(brought.value, true);
      }
    },
  );

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
        <Typography
          variant="subtitle2"
          component="span"
          tabIndex={-1}
          data-camera-heading
        >
          Camera
        </Typography>
        <Button variant="text" size="extraSmall" onClick={onClose}>
          Close
        </Button>
      </div>
      {/* Above 1 the view takes in less and shows it larger; below 1, more. */}
      <TextField
        name="camera-zoom"
        label="Zoom"
        inputType="number"
        size="s"
        value={draft.zoom}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setDraft(was => ({...was, zoom: event.target.value}))
        }
        onBlur={() => {
          const typed = Number(draft.zoom);
          if (Number.isFinite(typed) && typed > 0) {
            if (typed !== zoom) {
              onZoom(typed);
            }
          } else {
            setDraft(was => ({...was, zoom: String(zoom)}));
          }
        }}
        onKeyDown={blurOnEnter}
      />
      {choices.length === 0 ? (
        <Typography
          variant="body3"
          component="span"
          className={styles.inspectorNote}
        >
          A camera does more with a camera rule: following something, easing
          after it, staying inside the map.
        </Typography>
      ) : (
        // One closed control however many rules the project holds; what
        // each ticked trait is FOR is said below it, beside its fields.
        <CheckboxDropdown
          name="camera-traits"
          labelText="Camera traits"
          size="s"
          className={styles.traitPicker}
          styleAsFormField
          hideControls
          disabled={isReadOnly}
          allOptions={choices.map(choice => ({
            value: choice.value,
            label: choice.name,
          }))}
          checkedOptions={elected.map(choice => choice.value)}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onTrait(event.target.value, event.target.checked)
          }
        />
      )}
      {/* The camera rules' own shelf (`ImportRuleDialog`, subject
              camera): what a camera can be taught, and nothing an actor is.
              The rule it brings is ticked on THIS camera, so "make it
              follow" is one errand and not two. */}
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        disabled={isReadOnly}
        startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
        onClick={() => importRuleThen(requestCameraRuleImport, undefined)}
      >
        Add a camera rule…
      </Button>
      {elected.map(choice => (
        // A ticked trait: its name, what it does — a name like "Aimed"
        // says little — and then what can be set on it.
        <section key={choice.value} className={styles.inspectorGroup}>
          <Typography variant="body2" component="h3">
            {choice.name}
          </Typography>
          {choice.description && (
            <Typography
              variant="body3"
              component="p"
              className={styles.inspectorNote}
            >
              {choice.description}
            </Typography>
          )}
          {choice.properties.map(renderField)}
        </section>
      ))}
    </div>
  );
};

export default CameraInspector;
