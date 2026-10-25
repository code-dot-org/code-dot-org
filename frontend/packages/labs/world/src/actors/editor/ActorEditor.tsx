// The Actor Editor (SIMPLE_INTERFACE.md, "Actor Editor"; specs/ACTOR_EDITOR_PLAN.md,
// step 4): a data-shaped actor's file, shown as what the actor is.
//
// The panel down the left holds the actor's own properties (Self) and the
// traits it takes, each opening to its properties, with Enhance Actor at the
// foot. Beside it is the actor's picture and what it looks like. Its code is
// one press away, as a step on the breadcrumb.
//
// THE CODE, FOR NOW, IS ITS VIEW. Code opens the file editor over the
// `define actor` workspace the data stands for (`actorView`), and every save
// there is folded back into data (`asActorData`). The definition rows the
// panel shows are therefore in the code too, until the code rows can be
// roots of their own (specs/ACTOR_EDITOR_PLAN.md).

import {
  Button,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {parseAnim} from '../../animationEditor/animDocument';
import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import {requestEffectImport} from '../../blockly/effectImport';
import {parseEffectDocument} from '../../effect/model/schema';
import type {EffectParameter} from '../../effect/model/types';
import {DEFAULT_BACKDROP_COLOR} from '../../engine';
import {requestFileAct} from '../../files/fileActs';
import {fileLabel} from '../../files/fileLabel';
import {useScriptStep} from '../../layout/TrailContext';
import {gameModuleOf} from '../../mainWorld';
import {useAfterImport} from '../../mapEditor/useAfterImport';
import {filePath, projectFiles} from '../../runtime/projectFiles';
import {useWorldRuntime} from '../../runtime/WorldRuntimeContext';
import {asActorData, isActorData, viewOf, type ActorData} from '../actorData';
import type {ActorPurpose} from '../actorPurpose';
import {requestActorEnhance} from '../enhance/actorEnhance';

import styles from './actorEditor.module.css';
import {
  actorTraitChoices,
  addEffect,
  addProperty,
  addTrait,
  effectSettings,
  removeEffect,
  removeTrait,
  setEffectSetting,
  switchEffect,
  setLook,
  setPropertyDefault,
  setPurpose,
  setValue,
  takesValue,
  valueText,
  type TraitChoice,
} from './actorEdits';
import {ValueField} from './ValueField';

const parse = (contents: string): ActorData | undefined => {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return isActorData(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/** An effect file's parameters, or none for one that cannot be read. */
const parametersOf = (contents: string): EffectParameter[] => {
  try {
    return parseEffectDocument(contents).parameters;
  } catch {
    return [];
  }
};

/** The property types a new property of its own can be. */
const NEW_TYPES = ['number', 'string', 'boolean', 'color', 'vector'];

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

export const ActorEditor = (props: CustomEditorProps) => {
  const {fileId, initialContents, isReadOnly, onChange} = props;
  const {currentSources} = useSources<MultiFileSource>();
  const files = useMemo(
    () => projectFiles(currentSources.source),
    [currentSources],
  );
  const path = filePath(currentSources.source, fileId) ?? '';
  const modulePath = path.replace(/\.actor$/, '');

  // The file as last written here, and as the project holds it: a change
  // from outside (an enhancement, a rename) is taken up, and an echo of a
  // write made here is not a change.
  const [contents, setContents] = useState(initialContents);
  const written = useRef(initialContents);
  useEffect(() => {
    if (initialContents !== written.current) {
      written.current = initialContents;
      setContents(initialContents);
    }
  }, [initialContents]);
  const write = (next: string) => {
    if (next === written.current) {
      return;
    }
    written.current = next;
    setContents(next);
    onChange(next);
  };
  const data = parse(contents);
  const edit = (next: ActorData) => {
    if (data && next !== data) {
      write(JSON.stringify(next, null, 2));
    }
  };

  const [script, setScript, onTrail] = useScriptStep(fileId);
  const [tab, setTab] = useState<'traits' | 'effects'>('traits');
  const [enhanceAt, setEnhanceAt] = useState<HTMLElement | null>(null);
  const [effectAt, setEffectAt] = useState<HTMLElement | null>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('number');

  const choices = useMemo(() => actorTraitChoices(files), [files]);
  /** The project's effects, by module path, with what each is called. */
  const effectFiles = useMemo(
    () =>
      Object.entries(files)
        .filter(
          ([one]) => one.startsWith('effects/') && one.endsWith('.effect'),
        )
        .map(([one, held]) => ({
          path: one.replace(/\.effect$/, ''),
          name: fileLabel({name: one.split('/').pop(), contents: held}),
          parameters: parametersOf(held),
        })),
    [files],
  );
  const effectNamed = (effect: string) =>
    effectFiles.find(one => one.path === effect)?.name ??
    effect.split('/').pop() ??
    effect;
  const addEffectAt = (effect: string) => {
    const file = effectFiles.find(one => one.path === effect);
    if (data && file) {
      edit(addEffect(data, effect, file.parameters));
    }
  };
  // An effect brought from the shelf is added once the project holds it.
  const importEffectThen = useAfterImport(
    effectFiles.map(one => one.path),
    effect => addEffectAt(effect),
  );
  const taken = (data?.traits ?? []).map(
    value =>
      choices.find(choice => choice.value === value) ??
      // A trait no rule in the project offers any more: shown, so it can be
      // taken away, and with nothing to set.
      ({
        value,
        name: value.split('#').pop() ?? value,
        rule: '',
        properties: [],
      } as TraitChoice),
  );
  const untaken = choices.filter(
    choice => !(data?.traits ?? []).includes(choice.value),
  );

  // The actor's picture, as the sandbox draws it, asked again whenever the
  // file changes.
  const {getActorInfo, hasCompiled} = useWorldRuntime();
  // A fresh closure each render; held so asking again follows the file alone.
  const infoFn = useRef(getActorInfo);
  infoFn.current = getActorInfo;
  const [picture, setPicture] = useState<string>();
  const worldPath = gameModuleOf(files) ?? '';
  useEffect(() => {
    if (!hasCompiled || !modulePath || !worldPath) {
      return undefined;
    }
    let alive = true;
    void infoFn.current([modulePath], worldPath).then(info => {
      if (alive) {
        setPicture(info.thumbnails[modulePath]);
      }
    });
    return () => {
      alive = false;
    };
  }, [contents, hasCompiled, modulePath, worldPath]);

  /** What it can look like: the project's sprites, then its animations. */
  const looks = useMemo(() => {
    const sprites = Object.keys(files)
      .filter(one => one.startsWith('sprites/') && one.endsWith('.png'))
      .map(one => one.split('/').pop()!)
      .sort();
    const animations = Object.entries(files)
      .filter(([one]) => one.endsWith('.anim'))
      .flatMap(([, held]) => Object.keys(parseAnim(held).animations ?? {}))
      .sort();
    return [
      {value: '', text: '(drawn by its code)'},
      ...sprites.map(sprite => ({value: `sprite:${sprite}`, text: sprite})),
      ...animations.map(id => ({
        value: `animation:${id}`,
        text: `${id} (animation)`,
      })),
    ];
  }, [files]);
  const lookValue = !data?.look
    ? ''
    : 'sprite' in data.look
      ? `sprite:${data.look.sprite}`
      : `animation:${data.look.animation}`;

  if (script?.kind === 'code') {
    return (
      <div className={styles.code}>
        {!onTrail && (
          <div className={styles.codeHeader}>
            <Button
              variant="text"
              size="extraSmall"
              startIcon={
                <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
              }
              onClick={() => setScript(null)}
            >
              Actor
            </Button>
          </div>
        )}
        <div className={styles.codeBlocks}>
          <BlocklyFileEditor
            {...props}
            initialContents={viewOf(contents)}
            onChange={next => write(asActorData(next, written.current))}
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.editor}>
        <Typography variant="body3" className={styles.note}>
          This actor’s file cannot be read.
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.editor} data-testid="actor-editor">
      <div className={styles.head}>
        <Typography variant="h4" component="h2" className={styles.name}>
          {data.name}
        </Typography>
        {!isReadOnly && (
          <Button
            variant="text"
            size="small"
            onClick={() => void requestFileAct({act: 'rename', fileId})}
          >
            Rename
          </Button>
        )}
        <SimpleDropdown
          name="actor-purpose"
          labelText="For"
          size="s"
          disabled={isReadOnly}
          selectedValue={data.for ?? 'game'}
          items={[
            {value: 'game', text: 'Games'},
            {value: 'interface', text: 'Interfaces'},
            {value: 'both', text: 'Both'},
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            edit(setPurpose(data, event.target.value as ActorPurpose))
          }
        />
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          className={styles.codeButton}
          startIcon={
            <FontAwesomeV6Icon iconName="puzzle-piece" iconStyle="solid" />
          }
          onClick={() => setScript({kind: 'code'})}
        >
          Code
        </Button>
      </div>
      <div className={styles.body}>
        <div className={styles.panel}>
          <div className={styles.tabs}>
            <SegmentedButtons
              size="xs"
              selectedButtonValue={tab}
              onChange={value => setTab(value as 'traits' | 'effects')}
              buttons={[
                {value: 'traits', label: 'Traits'},
                {value: 'effects', label: 'Effects'},
              ]}
            />
          </div>
          {tab === 'effects' ? (
            <div className={styles.groups}>
              {(data.effects ?? []).length === 0 && (
                <Typography
                  variant="body3"
                  component="p"
                  className={`${styles.note} ${styles.group}`}
                >
                  No effects yet. An effect changes how the actor is drawn: a
                  ripple, a glow, a tint.
                </Typography>
              )}
              {(data.effects ?? []).map(effect => (
                <section
                  key={effect.effect}
                  className={styles.group}
                  aria-label={effectNamed(effect.effect)}
                >
                  <div className={styles.groupHead}>
                    <Typography variant="body2" component="h3">
                      {effectNamed(effect.effect)}
                    </Typography>
                    {!isReadOnly && (
                      <Button
                        variant="text"
                        size="extraSmall"
                        aria-label={`Remove ${effectNamed(effect.effect)}`}
                        onClick={() => edit(removeEffect(data, effect.effect))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {/* How it starts. Code and animations turn it on and off
                      while the game runs. */}
                  <Checkbox
                    name={`effect-${effect.effect}-on`}
                    label="On from the start"
                    checked={effect.on}
                    disabled={isReadOnly}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      edit(
                        switchEffect(data, effect.effect, event.target.checked),
                      )
                    }
                  />
                  {effectSettings(effect).map(setting => (
                    <ValueField
                      key={`${setting.param}-${setting.socket}`}
                      name={`effect-${effect.effect}-${setting.param}-${setting.socket}`}
                      label={capitalize(setting.label)}
                      type={setting.type}
                      value={setting.value}
                      isReadOnly={isReadOnly}
                      onValue={text =>
                        edit(
                          setEffectSetting(data, effect.effect, setting, text),
                        )
                      }
                    />
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <div className={styles.groups}>
              <section className={styles.group} aria-label="Self">
                <Typography variant="body2" component="h3">
                  Self
                </Typography>
                {(data.properties ?? []).map(property => (
                  <ValueField
                    key={property.name}
                    name={`self-${property.name}`}
                    label={capitalize(property.name)}
                    type={property.type}
                    value={
                      property.type === 'vector' || property.type === 'point'
                        ? `${property.value ?? 0},${property.valueY ?? 0}`
                        : (property.value ?? '')
                    }
                    isReadOnly={isReadOnly || !takesValue(property.type)}
                    onValue={text =>
                      edit(setPropertyDefault(data, property.name, text))
                    }
                  />
                ))}
                {!isReadOnly && (
                  <div className={styles.add}>
                    <TextField
                      name="self-new-name"
                      label="New property"
                      size="s"
                      value={newName}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setNewName(event.target.value)
                      }
                    />
                    <SimpleDropdown
                      name="self-new-type"
                      labelText="Kind"
                      size="s"
                      selectedValue={newType}
                      items={NEW_TYPES.map(type => ({value: type, text: type}))}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setNewType(event.target.value)
                      }
                    />
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      disabled={!newName.trim()}
                      onClick={() => {
                        edit(addProperty(data, newName, newType));
                        setNewName('');
                      }}
                    >
                      Add property
                    </Button>
                  </div>
                )}
              </section>
              {taken.map(trait => (
                <section
                  key={trait.value}
                  className={styles.group}
                  aria-label={trait.name}
                >
                  <div className={styles.groupHead}>
                    <Typography variant="body2" component="h3">
                      {trait.name}
                    </Typography>
                    {!isReadOnly && (
                      <Button
                        variant="text"
                        size="extraSmall"
                        aria-label={`Remove ${trait.name}`}
                        onClick={() => edit(removeTrait(data, trait))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {trait.description && (
                    <Typography
                      variant="body3"
                      component="p"
                      className={styles.note}
                    >
                      {trait.description}
                    </Typography>
                  )}
                  {trait.properties
                    .filter(property => takesValue(property.type))
                    .map(property => (
                      <ValueField
                        key={property.setter}
                        name={`trait-${property.setter}`}
                        label={capitalize(property.name)}
                        type={property.type}
                        value={
                          valueText(
                            (data.values ?? []).find(
                              value => value.setter === property.setter,
                            ),
                          ) ?? property.default
                        }
                        isReadOnly={isReadOnly}
                        onValue={text => edit(setValue(data, property, text))}
                      />
                    ))}
                </section>
              ))}
            </div>
          )}
          {!isReadOnly && tab === 'effects' && (
            <div className={styles.foot}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                fullWidth
                aria-haspopup="menu"
                startIcon={
                  <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
                }
                onClick={event => setEffectAt(event.currentTarget)}
              >
                Add Effect
              </Button>
              <Menu
                open={Boolean(effectAt)}
                anchorEl={effectAt}
                onClose={() => setEffectAt(null)}
              >
                {effectFiles
                  .filter(
                    file =>
                      !(data.effects ?? []).some(
                        one => one.effect === file.path,
                      ),
                  )
                  .map(file => (
                    <MenuItem
                      key={file.path}
                      onClick={() => {
                        setEffectAt(null);
                        addEffectAt(file.path);
                      }}
                    >
                      <ListItemText>{file.name}</ListItemText>
                    </MenuItem>
                  ))}
                <MenuItem
                  onClick={() => {
                    setEffectAt(null);
                    importEffectThen(requestEffectImport, undefined);
                  }}
                >
                  <ListItemText>Import…</ListItemText>
                </MenuItem>
              </Menu>
            </div>
          )}
          {!isReadOnly && tab === 'traits' && (
            <div className={styles.foot}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                fullWidth
                aria-haspopup="menu"
                startIcon={
                  <FontAwesomeV6Icon
                    iconName="wand-magic-sparkles"
                    iconStyle="solid"
                  />
                }
                onClick={event => setEnhanceAt(event.currentTarget)}
              >
                Enhance Actor
              </Button>
              <Menu
                open={Boolean(enhanceAt)}
                anchorEl={enhanceAt}
                onClose={() => setEnhanceAt(null)}
              >
                {untaken.map(choice => (
                  <MenuItem
                    key={choice.value}
                    onClick={() => {
                      setEnhanceAt(null);
                      edit(addTrait(data, choice.value));
                    }}
                  >
                    <ListItemText
                      primary={choice.name}
                      secondary={choice.rule}
                    />
                  </MenuItem>
                ))}
                {untaken.length > 0 && <Divider />}
                <MenuItem
                  onClick={() => {
                    setEnhanceAt(null);
                    void requestActorEnhance({
                      kind: 'actor',
                      path: modulePath,
                      name: data.name,
                    });
                  }}
                >
                  <ListItemText>Enhancements…</ListItemText>
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>
        <div className={styles.preview}>
          <div
            className={styles.picture}
            style={{background: DEFAULT_BACKDROP_COLOR}}
          >
            {picture ? (
              <img src={picture} alt={`${data.name}, as it is drawn`} />
            ) : (
              <Typography variant="body3" className={styles.note}>
                {data.name}
              </Typography>
            )}
          </div>
          <SimpleDropdown
            name="actor-look"
            labelText="Looks like"
            size="s"
            disabled={isReadOnly}
            selectedValue={lookValue}
            items={looks}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const [kind, ...rest] = event.target.value.split(':');
              const value = rest.join(':');
              edit(
                setLook(
                  data,
                  !kind
                    ? undefined
                    : kind === 'sprite'
                      ? {sprite: value}
                      : {animation: value},
                ),
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * An actor's file, in the editor its shape calls for: a data-shaped one in
 * the Actor Editor, and one still in blocks in the file editor, as before.
 */
export const ActorFileEditor = (props: CustomEditorProps) =>
  parse(props.initialContents) ? (
    <ActorEditor {...props} />
  ) : (
    <BlocklyFileEditor {...props} />
  );
