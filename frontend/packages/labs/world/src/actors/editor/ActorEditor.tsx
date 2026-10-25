// The Actor Editor (SIMPLE_INTERFACE.md, "Actor Editor"; specs/ACTOR_EDITOR_PLAN.md,
// step 4): a data-shaped actor's file, shown as what the actor is.
//
// The panel down the left holds the actor's own properties (Self) and the
// traits it takes, each opening to its properties, with Enhance Actor at the
// foot. Beside it is the actor's picture and what it looks like. Its code is
// one press away, as a step on the breadcrumb.
//
// THE CODE IS ITS WORKSPACE, AND ONLY THAT. Code opens the file editor over
// the actor's handlers and code rows, which stand there as roots
// (`blockly/codeRoots`); what it is stays in the panel, and what is saved
// there goes into the file's workspace with the data left as it was.

import {
  Button,
  Divider,
  IconButton,
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
import {isBackgroundPath} from '../../appearance/backgroundsFolder';
import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import {WORKSPACE_KEYS} from '../../blockly/documentExtras';
import {requestEffectImport} from '../../blockly/effectImport';
import {parseEffectDocument} from '../../effect/model/schema';
import type {EffectParameter} from '../../effect/model/types';
import {DEFAULT_BACKDROP_COLOR} from '../../engine';
import {requestFileAct} from '../../files/fileActs';
import {fileLabel} from '../../files/fileLabel';
import {useScriptStep} from '../../layout/TrailContext';
import {gameModuleOf} from '../../mainWorld';
import {useAfterImport} from '../../mapEditor/useAfterImport';
import {
  fileIdAt,
  filePath,
  projectFiles,
  projectImagePaths,
} from '../../runtime/projectFiles';
import {useWorldRuntime} from '../../runtime/WorldRuntimeContext';
import {isActorData, type ActorData} from '../actorData';
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
  setPurpose,
  setValue,
  takesValue,
  valueText,
  type TraitChoice,
} from './actorEdits';
import {SelfProperty} from './SelfProperty';
import {ValueField} from './ValueField';

const parse = (contents: string): ActorData | undefined => {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return isActorData(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/** The trait that gives an actor a box, and its drawing a box's size. */
const BOX_TRAIT = 'Boxed#HasABoxTrait';

/** The actor's code workspace, as the file editor is handed a file. */
const workspaceOf = (contents: string): string =>
  JSON.stringify(
    parse(contents)?.blocks ?? {blocks: {languageVersion: 0, blocks: []}},
    null,
    2,
  );

/** The file with its code workspace replaced, and its data as it was. */
const withWorkspace = (contents: string, saved: string): string => {
  const data = parse(contents);
  let workspace: Record<string, unknown>;
  try {
    workspace = JSON.parse(saved) as Record<string, unknown>;
  } catch {
    return contents;
  }
  if (!data) {
    return contents;
  }
  const blocks = Object.fromEntries(
    Object.entries(workspace).filter(([key]) => WORKSPACE_KEYS.has(key)),
  );
  return JSON.stringify({...data, blocks}, null, 2);
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
  const {currentSources, replaceSources} = useSources<MultiFileSource>();
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
  // An effect brought from the shelf, or made here, is added once the
  // project holds it; one made here is then opened in the effect editor, a
  // step on the trail (`fileActs`).
  const importEffectThen = useAfterImport<{open: boolean} | undefined>(
    effectFiles.map(one => one.path),
    (effect, then) => {
      addEffectAt(effect);
      if (then?.open) {
        void requestFileAct({act: 'open', path: `${effect}.effect`});
      }
    },
  );
  /** The effect whose row's menu is open, and where. */
  const [effectMenu, setEffectMenu] = useState<{
    effect: string;
    anchor: HTMLElement;
  } | null>(null);
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

  /**
   * What it can look like: the project's pictures that are not backdrops,
   * then its animations, as the blocks' own dropdowns offer them; and what it
   * looks like now, whatever that is, so the field never says otherwise.
   */
  const lookValue = !data?.look
    ? ''
    : 'sprite' in data.look
      ? `sprite:${data.look.sprite}`
      : `animation:${data.look.animation}`;
  const looks = useMemo(() => {
    const sprites = projectImagePaths(currentSources.source)
      .filter(one => !isBackgroundPath(one))
      .map(one => one.split('/').pop()!)
      .sort();
    const animations = Object.entries(files)
      .filter(([one]) => one.endsWith('.anim'))
      .flatMap(([, held]) => Object.keys(parseAnim(held).animations ?? {}))
      .sort();
    const items = [
      {value: '', text: '(drawn by its code)'},
      ...sprites.map(sprite => ({value: `sprite:${sprite}`, text: sprite})),
      ...animations.map(id => ({
        value: `animation:${id}`,
        text: `${id} (animation)`,
      })),
    ];
    return items.some(item => item.value === lookValue)
      ? items
      : [...items, {value: lookValue, text: lookValue.replace(/^[a-z]+:/, '')}];
  }, [files, currentSources, lookValue]);

  /**
   * The file behind what it looks like: a picture by its name among the
   * actors' pictures, an animation by the `.anim` that holds it. None for an
   * actor drawn by its code, or one naming what the project lacks.
   */
  const lookFile = useMemo(() => {
    const look = data?.look;
    if (!look) {
      return undefined;
    }
    const source = currentSources.source;
    if ('sprite' in look) {
      return Object.values(source.files).find(
        file =>
          file.name === look.sprite &&
          !isBackgroundPath(filePath(source, file.id) ?? ''),
      );
    }
    const holder = Object.entries(files).find(
      ([one, held]) =>
        one.endsWith('.anim') &&
        look.animation in (parseAnim(held).animations ?? {}),
    );
    const id = holder && fileIdAt(source, holder[0]);
    return id ? source.files[id] : undefined;
  }, [data?.look, currentSources, files]);
  const [lookAt, setLookAt] = useState<HTMLElement | null>(null);
  // A picture or animation made or drawn here is what the actor then looks
  // like: taken in the render whose project has the file, as an import is
  // (`useAfterImport`), and then, for one made to be drawn on, opened — a
  // step on the trail, the actor the crumb before it.
  const lookThen = useAfterImport<{open: boolean}>(
    Object.keys(currentSources.source.files),
    (madeId, {open}) => {
      const made = currentSources.source.files[madeId];
      if (!data || !made) {
        return;
      }
      const animation = made.name.endsWith('.anim')
        ? Object.keys(parseAnim(made.contents ?? '').animations ?? {})[0]
        : undefined;
      if (made.name.endsWith('.anim') && !animation) {
        return;
      }
      edit(setLook(data, animation ? {animation} : {sprite: made.name}));
      if (open) {
        // Opened on the file menus' next render, which has this save in it
        // (`fileActs`, `open`).
        void requestFileAct({act: 'open', fileId: madeId});
      }
    },
  );
  const lookAct = (act: () => void) => () => {
    setLookAt(null);
    act();
  };

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
            actorCode
            boxed={data?.traits?.includes(BOX_TRAIT) ?? false}
            initialContents={workspaceOf(contents)}
            onChange={next => write(withWorkspace(written.current, next))}
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
                    <div className={styles.groupActions}>
                      {/* The effect itself, not this actor's use of it:
                          opened in the effect editor, a step on the trail,
                          or renamed or deleted from the project. */}
                      <Button
                        variant="text"
                        size="extraSmall"
                        aria-label={`Edit ${effectNamed(effect.effect)}`}
                        onClick={() =>
                          void requestFileAct({
                            act: 'open',
                            path: `${effect.effect}.effect`,
                          })
                        }
                      >
                        Edit
                      </Button>
                      {!isReadOnly && (
                        <Button
                          variant="text"
                          size="extraSmall"
                          aria-label={`Remove ${effectNamed(effect.effect)}`}
                          onClick={() =>
                            edit(removeEffect(data, effect.effect))
                          }
                        >
                          Remove
                        </Button>
                      )}
                      {!isReadOnly && (
                        <IconButton
                          size="extraSmall"
                          color="tertiary"
                          aria-label={`More for ${effectNamed(effect.effect)}`}
                          aria-haspopup="menu"
                          onClick={event =>
                            setEffectMenu({
                              effect: effect.effect,
                              anchor: event.currentTarget,
                            })
                          }
                        >
                          <FontAwesomeV6Icon
                            iconName="ellipsis-v"
                            iconStyle="solid"
                          />
                        </IconButton>
                      )}
                    </div>
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
                  <SelfProperty
                    key={property.name}
                    property={property}
                    data={data}
                    fileId={fileId}
                    modulePath={modulePath}
                    source={currentSources.source}
                    onEdit={edit}
                    // A rename reaches other files, so the project is
                    // replaced, and the editors open on them read it again.
                    onProject={source =>
                      replaceSources({...currentSources, source})
                    }
                    isReadOnly={isReadOnly}
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
                    importEffectThen(
                      () =>
                        requestFileAct({
                          act: 'make',
                          folder: 'effects',
                          open: false,
                          answer: 'name',
                        }).then(
                          made =>
                            made && `effects/${made.replace(/\.effect$/, '')}`,
                        ),
                      {open: true},
                    );
                  }}
                >
                  <ListItemText>New effect…</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setEffectAt(null);
                    importEffectThen(requestEffectImport, undefined);
                  }}
                >
                  <ListItemText>Import…</ListItemText>
                </MenuItem>
              </Menu>
              {effectMenu && (
                <Menu
                  open
                  anchorEl={effectMenu.anchor}
                  onClose={() => setEffectMenu(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setEffectMenu(null);
                      void requestFileAct({
                        act: 'rename',
                        path: `${effectMenu.effect}.effect`,
                      });
                    }}
                  >
                    <ListItemText>
                      Rename {effectNamed(effectMenu.effect)}…
                    </ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setEffectMenu(null);
                      void requestFileAct({
                        act: 'delete',
                        path: `${effectMenu.effect}.effect`,
                      });
                    }}
                  >
                    <ListItemText>
                      Delete {effectNamed(effectMenu.effect)} from the project…
                    </ListItemText>
                  </MenuItem>
                </Menu>
              )}
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
          {/* THE WAY TO ITS PICTURES, where the picture is
              (specs/SHELL_FINISH_PLAN.md, step 4): Edit opens the one it
              looks like, as a step on the trail; the menu makes, brings in,
              renames and deletes them. */}
          <div className={styles.lookActions}>
            {lookFile && (
              <Button
                variant="text"
                size="small"
                startIcon={
                  <FontAwesomeV6Icon
                    iconName="pen-to-square"
                    iconStyle="solid"
                  />
                }
                onClick={() =>
                  void requestFileAct({act: 'open', fileId: lookFile.id})
                }
              >
                {'sprite' in (data.look ?? {})
                  ? 'Edit picture'
                  : 'Edit animation'}
              </Button>
            )}
            {!isReadOnly && (
              <Button
                variant="text"
                size="small"
                aria-haspopup="menu"
                aria-expanded={lookAt !== null}
                endIcon={
                  <FontAwesomeV6Icon
                    iconName="chevron-down"
                    iconStyle="solid"
                  />
                }
                onClick={event => setLookAt(event.currentTarget)}
              >
                Pictures
              </Button>
            )}
            {lookAt && (
              <Menu open anchorEl={lookAt} onClose={() => setLookAt(null)}>
                <MenuItem
                  onClick={lookAct(() =>
                    lookThen(
                      () =>
                        requestFileAct({
                          act: 'make',
                          folder: 'sprites',
                          open: false,
                        }),
                      {open: true},
                    ),
                  )}
                >
                  <ListItemText>New picture…</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={lookAct(() =>
                    lookThen(
                      () =>
                        requestFileAct({
                          act: 'make',
                          folder: 'animations',
                          open: false,
                        }),
                      {open: true},
                    ),
                  )}
                >
                  <ListItemText>New animation…</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={lookAct(
                    () =>
                      void requestFileAct({act: 'upload', folder: 'sprites'}),
                  )}
                >
                  <ListItemText>Upload a picture…</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={lookAct(() =>
                    lookThen(
                      () => requestFileAct({act: 'draw', folder: 'sprites'}),
                      {open: false},
                    ),
                  )}
                >
                  <ListItemText>Draw a picture with AI…</ListItemText>
                </MenuItem>
                {lookFile && <Divider />}
                {lookFile && (
                  <MenuItem
                    onClick={lookAct(
                      () =>
                        void requestFileAct({
                          act: 'rename',
                          fileId: lookFile.id,
                        }),
                    )}
                  >
                    <ListItemText>Rename {fileLabel(lookFile)}…</ListItemText>
                  </MenuItem>
                )}
                {lookFile && (
                  <MenuItem
                    onClick={lookAct(
                      () =>
                        void requestFileAct({
                          act: 'delete',
                          fileId: lookFile.id,
                        }),
                    )}
                  >
                    <ListItemText>Delete {fileLabel(lookFile)}…</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            )}
          </div>
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
