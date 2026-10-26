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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import {usePrompts, type CustomEditorProps} from '@code-dot-org/codebridge';
import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import TextField from '@code-dot-org/component-library/textField';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';

import {requestAppearanceImport} from '../../appearance/appearanceImport';
import {isBackgroundPath} from '../../appearance/backgroundsFolder';
import {largestCell} from '../../appearance/paintTimeline';
import {projectSheets} from '../../appearance/sheetFile';
import {stockAnimation} from '../../appearance/stock';
import {TimelineThumb} from '../../appearance/TimelineThumb';
import {useProjectImages} from '../../appearance/useProjectImages';
import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import {WORKSPACE_KEYS} from '../../blockly/documentExtras';
import {requestEffectImport} from '../../blockly/effectImport';
import {projectActorOptions} from '../../blockly/projectModules';
import {parseEffectDocument} from '../../effect/model/schema';
import type {EffectParameter} from '../../effect/model/types';
import {DEFAULT_BACKDROP_COLOR} from '../../engine';
import {requestFileAct} from '../../files/fileActs';
import {fileLabel} from '../../files/fileLabel';
import {useScriptStep} from '../../layout/TrailContext';
import {showsRuleSource, type WorldLevelProperties} from '../../levelData';
import {gameModuleOf} from '../../mainWorld';
import {useAfterImport} from '../../mapEditor/useAfterImport';
import {
  filePath,
  projectFiles,
  projectImagePaths,
} from '../../runtime/projectFiles';
import {useWorldRuntime} from '../../runtime/WorldRuntimeContext';
import {
  isActorData,
  isAnimated,
  lookOf,
  MAIN_ANIMATION,
  withMainAnimation,
  type ActorData,
} from '../actorData';
import {requestActorEnhance} from '../enhance/actorEnhance';

import styles from './actorEditor.module.css';
import {
  actorTraitChoices,
  addEffect,
  addProperty,
  addAnimation,
  addAnimationFrames,
  addTrait,
  setActsLike,
  setIcon,
  setIsRecord,
  animationNameProblem,
  animationNames,
  effectSettings,
  removeAnimation,
  removeEffect,
  moveAnimationKey,
  removeAnimationKey,
  renameAnimation,
  removeTrait,
  setAnimationKey,
  setAnimationLength,
  setAnimationLoop,
  setEffectSetting,
  switchEffect,
  setLook,
  setValue,
  takesValue,
  valueText,
  type TraitChoice,
} from './actorEdits';
import {ActorIconPicker} from './ActorIconPicker';
import {AddFramesDialog} from './AddFramesDialog';
import {AnimationRow} from './AnimationRow';
import {MomentPanel} from './MomentPanel';
import {SelfProperty} from './SelfProperty';
import {TimelineStrip} from './TimelineStrip';
import {ValueField} from './ValueField';

const parse = (contents: string): ActorData | undefined => {
  try {
    const parsed = JSON.parse(contents) as unknown;
    return isActorData(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/** How big the actor's picture is drawn, in CSS pixels: the 12rem box. */
const PREVIEW_SIZE = 192;

/** Looks like's row for a Main that moves, and for the library's door. */
const ANIMATED = 'animated:';
const FROM_LIBRARY = 'library:';

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
const NEW_TYPES = ['number', 'string', 'boolean', 'color', 'picture', 'vector'];

const capitalize = (text: string) =>
  text ? text[0].toUpperCase() + text.slice(1) : text;

export const ActorEditor = (props: CustomEditorProps) => {
  const {fileId, initialContents, isReadOnly, onChange} = props;
  const {currentSources, replaceSources} = useSources<MultiFileSource>();
  // Whether this level offers a way to the file behind a trait: the same
  // call the `use rule` block's open button answers to (`levelData`).
  const ruleSource = showsRuleSource(
    useMaybeLevelProperties<WorldLevelProperties>(),
  );
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
  const {promptForName, confirm} = usePrompts();
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
   * What it can look like: the project's pictures that are not backdrops;
   * its own Main animation, when Main moves; and an animation from the
   * library, which becomes its Main (specs/ANIMATION_PLAN.md). And what it
   * looks like now, whatever that is, so the field never says otherwise.
   */
  // Main's picture, or the flipbook it plays (`actorData.lookOf`).
  const look = useMemo(() => {
    const held = parse(contents);
    return held ? lookOf(held) : undefined;
  }, [contents]);
  const animated = useMemo(() => {
    const held = parse(contents);
    return held ? isAnimated(held) : false;
  }, [contents]);
  const pictureNames = useMemo(
    () =>
      projectImagePaths(currentSources.source)
        .filter(one => !isBackgroundPath(one))
        .map(one => one.split('/').pop()!)
        .sort(),
    [currentSources],
  );
  const lookValue = animated ? ANIMATED : look ? `sprite:${look.sprite}` : '';
  const looks = useMemo(() => {
    const items = [
      {value: '', text: '(drawn by its code)'},
      ...pictureNames.map(sprite => ({
        value: `sprite:${sprite}`,
        text: sprite,
      })),
      ...(animated ? [{value: ANIMATED, text: '(its own animation)'}] : []),
      {value: FROM_LIBRARY, text: '(an animation from the library…)'},
    ];
    return items.some(item => item.value === lookValue)
      ? items
      : [...items, {value: lookValue, text: lookValue.replace(/^[a-z]+:/, '')}];
  }, [pictureNames, animated, lookValue]);
  // An animation from the library is its Main: taken once its pictures are
  // in the project, which is the render that has them (`useAfterImport`).
  const libraryAnimation = useRef('');
  const mainThen = useAfterImport(pictureNames, () => {
    const stock = stockAnimation(libraryAnimation.current);
    if (data && stock) {
      edit(withMainAnimation(data, stock.timeline));
    }
  });
  const fromLibrary = () =>
    mainThen(
      () =>
        requestAppearanceImport('animation').then(id => {
          const stock = id ? stockAnimation(id) : undefined;
          libraryAnimation.current = stock?.id ?? '';
          return stock?.sprites[0] ? `${stock.sprites[0]}.png` : undefined;
        }),
      undefined,
    );

  /**
   * The file behind what it looks like: the picture it shows, or its Main
   * shows first, by its name among the actors' pictures. None for an actor
   * drawn by its code, or one naming what the project lacks.
   */
  const lookFile = useMemo(() => {
    if (!look) {
      return undefined;
    }
    const source = currentSources.source;
    return Object.values(source.files).find(
      file =>
        file.name === look.sprite &&
        !isBackgroundPath(filePath(source, file.id) ?? ''),
    );
  }, [look, currentSources]);
  const [lookAt, setLookAt] = useState<HTMLElement | null>(null);
  // A picture made or drawn here is what the actor then looks like: taken in
  // the render whose project has the file, as an import is
  // (`useAfterImport`), and then, for one made to be drawn on, opened — a
  // step on the trail, the actor the crumb before it.
  const lookThen = useAfterImport<{open: boolean}>(
    Object.keys(currentSources.source.files),
    (madeId, {open}) => {
      const made = currentSources.source.files[madeId];
      if (!data || !made) {
        return;
      }
      edit(setLook(data, {sprite: made.name}));
      if (open) {
        // Opened on the file menus' next render, which has this save in it
        // (`fileActs`, `open`).
        void requestFileAct({act: 'open', fileId: madeId});
      }
    },
  );
  // ── Its animations (specs/ANIMATION_PLAN.md, step 5) ──
  const names = useMemo(() => {
    const held = parse(contents);
    return held ? animationNames(held) : [];
  }, [contents]);
  // The one chosen, kept to one it has: Main, else the first.
  const [chosen, setChosen] = useState<string>();
  const selected = chosen && names.includes(chosen) ? chosen : names[0];
  const projectImages = useProjectImages(currentSources.source);
  const imageFor = useCallback(
    (file: string) => projectImages[file],
    [projectImages],
  );
  const chosenTimeline = selected
    ? parse(contents)?.animations?.[selected]
    : undefined;
  // One that only moves or fades is painted on Main's pictures, which is
  // what the game shows it on: an animation with no picture track leaves the
  // picture as the actor has it (`core/keyframes.valueAt`).
  const mainPictures =
    parse(contents)?.animations?.[MAIN_ANIMATION]?.tracks.sprite;
  const shownTimeline =
    chosenTimeline && !chosenTimeline.tracks.sprite && mainPictures
      ? {
          ...chosenTimeline,
          tracks: {sprite: mainPictures, ...chosenTimeline.tracks},
        }
      : chosenTimeline;
  const shown =
    shownTimeline &&
    largestCell(shownTimeline, imageFor).width > 0 &&
    (shownTimeline.tracks.sprite?.length ?? 0) > 0
      ? shownTimeline
      : undefined;
  // Where the playhead is, in seconds; back to the start for another one.
  const [time, setTime] = useState(0);
  // Adding frames from a sheet: the dialog, and the sheets it offers.
  const [addingFrames, setAddingFrames] = useState(false);
  const sheets = useMemo(() => projectSheets(files), [files]);
  const [selectedKey, setSelectedKey] = useState<
    {property: string; at: number} | undefined
  >();
  useEffect(() => {
    setTime(0);
    setSelectedKey(undefined);
  }, [selected]);
  const newAnimation = async () => {
    if (!data) {
      return;
    }
    const name = await promptForName({
      title: 'New animation',
      placeholder: 'Walk',
      validateInput: value => animationNameProblem(data, value),
    });
    if (name) {
      edit(addAnimation(data, name));
      setChosen(name.trim());
    }
  };
  const renameOne = async (was: string) => {
    if (!data) {
      return;
    }
    const name = await promptForName({
      title: `Rename ${was}`,
      value: was,
      validateInput: value => animationNameProblem(data, value, was),
    });
    if (name && name.trim() !== was) {
      edit(renameAnimation(data, was, name));
      setChosen(name.trim());
    }
  };
  const removeOne = async (name: string) => {
    if (
      data &&
      (await confirm({
        title: 'Delete animation',
        message: `Delete ${name}? Code that plays it will play nothing.`,
      }))
    ) {
      edit(removeAnimation(data, name));
      setChosen(undefined);
    }
  };

  // Drawn and shown by its icon, with no pictures to choose
  // (specs/ACTORS_AS_DATA_PLAN.md, step 3).
  const isInterface = data?.for === 'interface';
  // What it may act like: the project's other actors.
  const others = useMemo(
    () => projectActorOptions(files).filter(([, path]) => path !== modulePath),
    [files, modulePath],
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
        {/* WHAT IT IS FOR IS SAID, NOT CHOSEN. It is decided when the actor
            is made — by the palette tab its Add New Actor was under, or by
            the library — and never changed: a game actor wears pictures and
            an interface actor is drawn, and turning one into the other would
            take away what it has (specs/ACTORS_AS_DATA_PLAN.md). */}
        <Typography variant="body3" component="p" className={styles.purpose}>
          {isInterface ? 'Interface actor' : 'Game actor'}
        </Typography>
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
              {/* What kind of thing it is, beyond its traits. */}
              <section className={styles.group} aria-label="What it is">
                <SimpleDropdown
                  name="actor-acts-like"
                  labelText="Acts like"
                  size="s"
                  disabled={isReadOnly}
                  selectedValue={data.actsLike ?? ''}
                  items={[
                    {value: '', text: '(nothing else)'},
                    ...others.map(([name, path]) => ({
                      value: path,
                      text: name,
                    })),
                    // Named even when it is not in the project, so the field
                    // never says otherwise.
                    ...(data.actsLike &&
                    !others.some(([, path]) => path === data.actsLike)
                      ? [{value: data.actsLike, text: data.actsLike}]
                      : []),
                  ]}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    edit(setActsLike(data, event.target.value || undefined))
                  }
                />
                <Checkbox
                  name="actor-is-record"
                  label="Is a record"
                  checked={Boolean(data.isData)}
                  disabled={isReadOnly}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    edit(setIsRecord(data, event.target.checked))
                  }
                />
                <Typography variant="body3" className={styles.note}>
                  A record is fields to keep and find, with nowhere to be drawn.
                </Typography>
              </section>
              <section className={styles.group} aria-label="Self">
                <Typography variant="body2" component="h3">
                  Self
                </Typography>
                {(data.properties ?? []).map(property => (
                  <SelfProperty
                    key={property.name}
                    property={property}
                    pictures={pictureNames}
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
                    <div className={styles.groupActions}>
                      {/* Where the trait is written: its rule, opened as a
                          step on the trail, which is how a learner reads
                          what a trait does and changes it
                          (specs/ACTORS_AS_DATA_PLAN.md, step 7). */}
                      {ruleSource && trait.rulePath && (
                        <Button
                          variant="text"
                          size="extraSmall"
                          aria-label={`Open the ${trait.rule} rule`}
                          onClick={() =>
                            void requestFileAct({
                              act: 'open',
                              path: `${trait.rulePath}.rule`,
                            })
                          }
                        >
                          Rule
                        </Button>
                      )}
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
                        pictures={pictureNames}
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
                        act: 'clone',
                        path: `${effectMenu.effect}.effect`,
                      });
                    }}
                  >
                    <ListItemText>
                      Clone {effectNamed(effectMenu.effect)}…
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
          {data.isData ? (
            <Typography variant="body3" className={styles.note}>
              {data.name} is a record: it is kept and found by code, and is
              never drawn, so it has no look and no animations.
            </Typography>
          ) : (
            <>
              <div
                className={styles.picture}
                style={{background: DEFAULT_BACKDROP_COLOR}}
              >
                {/* The chosen animation at its start, painted here from the
                project's pictures; the sandbox's picture of the actor when
                there is none to paint (`TimelineThumb`). */}
                {shown ? (
                  <span
                    role="img"
                    aria-label={`${data.name}, ${selected} at ${
                      Math.round(time * 10) / 10
                    } seconds`}
                  >
                    <TimelineThumb
                      timeline={shown}
                      imageFor={imageFor}
                      size={PREVIEW_SIZE}
                      playing={false}
                      at={time}
                    />
                  </span>
                ) : picture ? (
                  <img src={picture} alt={`${data.name}, as it is drawn`} />
                ) : (
                  <Typography variant="body3" className={styles.note}>
                    {data.name}
                  </Typography>
                )}
              </div>
              {isInterface ? (
                // Drawn, and shown by its icon (specs/ACTORS_AS_DATA_PLAN.md,
                // step 3): no pictures to choose.
                <ActorIconPicker
                  selected={data.icon}
                  onChange={icon => edit(setIcon(data, icon))}
                  isReadOnly={isReadOnly}
                />
              ) : (
                <>
                  <SimpleDropdown
                    name="actor-look"
                    labelText="Looks like"
                    size="s"
                    disabled={isReadOnly}
                    selectedValue={lookValue}
                    items={looks}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                      if (event.target.value === ANIMATED) {
                        return;
                      }
                      if (event.target.value === FROM_LIBRARY) {
                        fromLibrary();
                        return;
                      }
                      const value = event.target.value.replace(/^sprite:/, '');
                      edit(setLook(data, value ? {sprite: value} : undefined));
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
                          void requestFileAct({
                            act: 'open',
                            fileId: lookFile.id,
                          })
                        }
                      >
                        Edit picture
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
                      <Menu
                        open
                        anchorEl={lookAt}
                        onClose={() => setLookAt(null)}
                      >
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
                        <MenuItem onClick={lookAct(fromLibrary)}>
                          <ListItemText>
                            Animation from the library…
                          </ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={lookAct(
                            () =>
                              void requestFileAct({
                                act: 'upload',
                                folder: 'sprites',
                              }),
                          )}
                        >
                          <ListItemText>Upload a picture…</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={lookAct(() =>
                            lookThen(
                              () =>
                                requestFileAct({
                                  act: 'draw',
                                  folder: 'sprites',
                                }),
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
                            <ListItemText>
                              Rename {fileLabel(lookFile)}…
                            </ListItemText>
                          </MenuItem>
                        )}
                        {lookFile && (
                          <MenuItem
                            onClick={lookAct(
                              () =>
                                void requestFileAct({
                                  act: 'clone',
                                  fileId: lookFile.id,
                                }),
                            )}
                          >
                            <ListItemText>
                              Clone {fileLabel(lookFile)}…
                            </ListItemText>
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
                            <ListItemText>
                              Delete {fileLabel(lookFile)}…
                            </ListItemText>
                          </MenuItem>
                        )}
                      </Menu>
                    )}
                  </div>
                </>
              )}
              <AnimationRow
                names={names}
                selected={selected}
                loop={Boolean(selected && data.animations?.[selected]?.loop)}
                onSelect={setChosen}
                onAdd={() => void newAnimation()}
                onRename={name => void renameOne(name)}
                onRemove={name => void removeOne(name)}
                onLoop={(name, loop) =>
                  edit(setAnimationLoop(data, name, loop))
                }
                isReadOnly={isReadOnly}
              />
              {selected && chosenTimeline && (
                <>
                  <TimelineStrip
                    name={selected}
                    timeline={chosenTimeline}
                    time={time}
                    onTime={setTime}
                    effectName={path => effectNamed(path)}
                    selectedKey={selectedKey}
                    onSelectKey={setSelectedKey}
                    onMoveKey={
                      isReadOnly
                        ? undefined
                        : (property, from, to) => {
                            edit(
                              moveAnimationKey(
                                data,
                                selected,
                                property,
                                from,
                                to,
                              ),
                            );
                            setSelectedKey({property, at: to});
                          }
                    }
                    onDeleteKey={
                      isReadOnly
                        ? undefined
                        : (property, at) => {
                            edit(
                              removeAnimationKey(data, selected, property, at),
                            );
                            setSelectedKey(undefined);
                          }
                    }
                    onAddFrames={
                      isReadOnly || isInterface
                        ? undefined
                        : () => setAddingFrames(true)
                    }
                    onLength={
                      isReadOnly
                        ? undefined
                        : length =>
                            edit(setAnimationLength(data, selected, length))
                    }
                  />
                  <MomentPanel
                    timeline={chosenTimeline}
                    time={time}
                    pictures={isInterface ? undefined : pictureNames}
                    effects={(data.effects ?? []).map(effect => ({
                      path: effect.effect,
                      name: effectNamed(effect.effect),
                    }))}
                    onSet={(property, value) =>
                      edit(
                        setAnimationKey(data, selected, property, time, value),
                      )
                    }
                    isReadOnly={isReadOnly}
                  />
                  {Object.keys(chosenTimeline.tracks).some(track =>
                    track.startsWith('effect:'),
                  ) && (
                    // A shader, which only the game runs.
                    <Typography variant="body3" className={styles.note}>
                      Effects are not shown here. Run the game to see them.
                    </Typography>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {addingFrames && selected && (
        <AddFramesDialog
          sheets={sheets}
          images={projectImages}
          onAdd={(sprite, cells, frameRate) => {
            setAddingFrames(false);
            edit(
              addAnimationFrames(
                data,
                selected,
                sprite,
                cells,
                time,
                frameRate,
              ),
            );
          }}
          onCancel={() => setAddingFrames(false)}
        />
      )}
    </div>
  );
};

/**
 * An actor's file. Always the Actor Editor: an actor is data and events,
 * and no actor is opened as a `define actor` (specs/ACTORS_AS_DATA_PLAN.md,
 * step 5). A file that is not data says it cannot be read.
 */
export const ActorFileEditor = ActorEditor;
