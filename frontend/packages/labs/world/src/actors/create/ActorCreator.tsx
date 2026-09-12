// The Actor Creator: the frame, and the first question it asks.
//
// `New actor` asked for a name and wrote `define actor named ⟨Chaser⟩` and
// nothing else, leaving everything that makes it an actor to a learner who had
// to know four separate things first (specs/ACTOR_CREATION_WIZARD.md). This is
// the frame that asks them instead — a sequence of steps, each a question with
// a visible answer, ending in a file worth opening.
//
// THE ABILITIES STEP APPLIES AND STAYS, which is the one way it is not the
// enhancement dialog. That one takes a row and closes, which is right for what
// it is — "give this actor one more thing", asked from the actor's own menu or
// from the wand on its `define actor`. Building an actor up is a different
// act, and walking in and out of a dialog once per ability would make a
// Crawler three round trips. What the two share is the ROW
// (`enhance/EnhancementRows`), not the frame around it.
//
// The picture step needed no lifting at all. What it shows is whole
// pictures and whole animations, and both already have a component that draws
// one — `animationEditor/CellThumb` and `animationEditor/AnimationThumb` — so
// it asks for them directly rather than borrowing a grid built to offer the
// CELLS of a spritesheet, which is a question an actor's `set sprite` does not
// ask (it names a file).
//
// STEP ONE IS THREE DOORS, and two of them fill in the steps after: a copied
// Crawler already has a sprite and already patrols, so the picture step will
// open on its picture and the shelf will show its verbs as things it has. None
// of that needs remembering — `Enhancement.applied` already reads an actor's
// own chain, and the picture step's answer is the source's own `set sprite`
// row. The wizard shows what is there rather than what it did.
//
// COPYING AND TEMPLATING ARE SEPARATE DOORS although both start from
// something, because they differ in everything but the sentence: a copy is a
// clone of a file the learner owns, resolved so it is a copy rather than a
// reference, and a template is an import that writes every file the actor's
// rows name — seven, for a Coin. And the learner's thought differs too:
// "another one like my Crawler" is not "one of theirs, to start from".
//
// IT WRITES ONCE, AT THE END, and an earlier draft of this had it writing at
// the end of step one on the grounds that cloning and importing write files.
// They do not: both are pure transforms over a project source, and so is
// `Enhancement.apply`. So the wizard collects answers and the caller performs
// them in one go — which is what makes Back work at all, and what means a
// wizard somebody walks out of leaves nothing behind.

import {Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {AnimationThumb} from '../../animationEditor/AnimationThumb';
import type {AnimDef} from '../../animationEditor/animDocument';
import {CellThumb} from '../../animationEditor/CellThumb';
import {
  DRAW_COUNT,
  type GeneratedPicture,
  type ImageGenerator,
} from '../../appearance/generate/imageGenerator';
import {EnhancementRows, refusalOf} from '../enhance/EnhancementRows';
import type {Enhancement, EnhanceTarget} from '../enhance/enhancements';

import styles from './actorCreator.module.css';
import type {ActorLook} from './actorLook';

/** Where a new actor comes from. */
export type OriginKind = 'new' | 'copy' | 'template';

/** One actor the project already has, offered to be copied. */
export interface CopyableActor {
  /** The file to clone. */
  fileId: string;
  name: string;
  /** A picture to draw it by, where the registries have one. */
  picture?: string;
  /** What it already looks like, which the picture step opens on. */
  look?: ActorLook;
}

/** One actor the library offers to start from. */
export interface ActorTemplate {
  /** Its stock id, which is what an import is asked for by. */
  id: string;
  name: string;
  description: string;
  /** …and the same, read off the workspace the import copies. */
  look?: ActorLook;
}

/** One animation the project holds, to be shown playing. */
export interface PickableAnimation {
  /** The id a `play animation` row stores. */
  id: string;
  name: string;
  animation?: AnimDef;
}

/** What the wizard comes to. */
export interface ActorDraft {
  origin: OriginKind;
  /** The file to clone, for `copy`; the stock id, for `template`. */
  source?: string;
  name: string;
  /**
   * What it is drawn as, or nothing to leave it as it came.
   *
   * Nothing is a real answer rather than an unanswered question: an actor made
   * from nothing has no picture and may want none — an interface actor paints
   * itself — and one copied from something already looks like it.
   */
  look?: ActorLook;
}

export interface ActorCreatorProps {
  actors: readonly CopyableActor[];
  templates: readonly ActorTemplate[];
  /** The project's pictures, by file name — what a `set sprite` row stores. */
  sprites: readonly string[];
  /** Those pictures decoded, which is what a canvas can draw. */
  images: Record<string, HTMLImageElement>;
  /** The project's animations, which the tiles play. */
  animations: readonly PickableAnimation[];
  /**
   * Somewhere pictures come from, when a learner describes one instead.
   *
   * Absent means the door is not offered at all rather than offered and
   * broken: a lab with nothing behind it should look like a lab without the
   * feature (`appearance/generate/imageGenerator`).
   */
  drawing?: ImageGenerator;
  /**
   * Keep one of the drawn pictures — write it into the project, and answer
   * with the file name it landed under.
   *
   * The caller's, because writing a file is: what comes back from a generator
   * is bytes, and what a `set sprite` row names is a file in `sprites/`.
   */
  onKeep?: (picture: GeneratedPicture) => Promise<string | undefined>;
  /**
   * Whether a name may be used — the caller's rule, not this dialog's.
   *
   * The same check `New actor` makes, which knows about the project's files
   * and about what a file name may be (`files/FileMenus.nameProblem`). Returns
   * the complaint, or nothing when the name is fine.
   */
  nameProblem?: (name: string) => string | undefined;
  /**
   * The project with this actor in it, and where it landed — WITHOUT writing
   * anything.
   *
   * Every step of making one is a pure transform over a project source, so the
   * wizard can hold the answer to "what would this be?" and show the abilities
   * step what the actor already has. Nothing reaches the learner's project
   * until `onCreate`.
   */
  build: (draft: ActorDraft) => BuiltActor | undefined;
  /**
   * Write it. Answers whether it worked, because this cannot tell: the caller
   * commits and the lab's reconcile gets the last word.
   */
  onCreate: (source: MultiFileSource) => Promise<boolean> | boolean;
  onCancel: () => void;
}

/** What `build` answers: a project with the actor in it, and its path. */
export interface BuiltActor {
  source: MultiFileSource;
  path: string;
}

/** One door of step one. */
const DOORS: ReadonlyArray<{
  kind: OriginKind;
  name: string;
  what: string;
}> = [
  {
    kind: 'new',
    name: 'Create my own',
    what: 'An empty actor, named and ready to build up.',
  },
  {
    kind: 'copy',
    name: 'Copy one of mine',
    what: 'Start from one this project already has, and change it.',
  },
  {
    kind: 'template',
    name: 'Start from a template',
    what: 'Start from one of the library’s, brought in whole.',
  },
];

/**
 * The steps, in order.
 *
 * A LIST rather than a pair of branches, because the two that are not built
 * yet are the reason this component exists at all: the shell has to be able to
 * say "step 1 of 3" and to move between them before there is anything to move
 * to. What is not here is content, not machinery.
 */
const STEPS = [
  {id: 'origin', title: 'Where does it come from?'},
  {id: 'look', title: 'What does it look like?'},
  {id: 'abilities', title: 'What can it do?'},
] as const;

/** How wide a picture tile is drawn. Tall art is fitted inside it. */
const TILE = 56;

export const ActorCreator = ({
  actors,
  templates,
  sprites,
  images,
  animations,
  drawing,
  onKeep,
  nameProblem,
  build,
  onCreate,
  onCancel,
}: ActorCreatorProps) => {
  const [at, setAt] = useState(0);
  const [origin, setOrigin] = useState<OriginKind>();
  const [source, setSource] = useState<string>();
  const [name, setName] = useState('');
  const [look, setLook] = useState<ActorLook>();
  const [busy, setBusy] = useState(false);
  /**
   * The actor as it would be, once there is enough to say.
   *
   * Built on the way INTO the abilities step and edited by it, so what those
   * rows read is the actor the learner is making rather than the project as it
   * stands. Nothing here is written; `onCreate` is the only thing that writes.
   */
  const [built, setBuilt] = useState<BuiltActor>();
  const [chosen, setChosen] = useState<Enhancement | null>(null);
  const [answer, setAnswer] = useState<string>();
  /** What the learner typed, what came back, and whether it is still coming. */
  const [prompt, setPrompt] = useState('');
  const [drawn, setDrawn] = useState<readonly GeneratedPicture[]>([]);
  const [drawingNow, setDrawingNow] = useState(false);

  /**
   * The name to write, which is the typed one or the chosen thing's.
   *
   * A template arrives called what the library calls it and a clone has one to
   * vary, so an untouched field is not an unanswered question — it is the
   * answer the door already gave. Only "create my own" starts with nothing.
   */
  const suggested = useMemo(() => {
    if (origin === 'template') {
      return templates.find(one => one.id === source)?.name ?? '';
    }
    if (origin === 'copy') {
      return actors.find(one => one.fileId === source)?.name ?? '';
    }
    return '';
  }, [origin, source, actors, templates]);

  /**
   * What the thing chosen in step one already looks like.
   *
   * The picture step opens on it rather than on an empty grid, which is the
   * whole reason step one comes first: a copied Crawler is already a Crawler.
   */
  const inherited = useMemo(() => {
    if (origin === 'template') {
      return templates.find(one => one.id === source)?.look;
    }
    if (origin === 'copy') {
      return actors.find(one => one.fileId === source)?.look;
    }
    return undefined;
  }, [origin, source, actors, templates]);

  const showing = look ?? inherited;

  const chosenName = name.trim() || suggested;
  const problem = chosenName ? nameProblem?.(chosenName) : undefined;

  /**
   * Whether this step has been answered well enough to leave.
   *
   * The picture step is never unanswered: an actor may have no picture at all,
   * and one that came from something already has whatever it had. So the gate
   * is step one's, and step two's button is a way on rather than a demand.
   */
  const ready =
    origin !== undefined &&
    (origin === 'new' || source !== undefined) &&
    chosenName.length > 0 &&
    problem === undefined;

  const last = at === STEPS.length - 1;

  /** The actor these rows are about, named as everything else names one. */
  const target: EnhanceTarget | undefined = built && {
    kind: 'actor',
    path: built.path,
    name: chosenName,
  };

  /** Whether the chosen row can be applied as it stands. */
  const addable = Boolean(
    chosen &&
      built &&
      target &&
      !refusalOf(chosen, built.source, target, answer) &&
      (!chosen.asks || answer !== undefined),
  );

  /**
   * Ask for pictures, and put what comes back where they can be compared.
   *
   * The words are KEPT. The commonest second action is a small edit to the
   * prompt rather than a fresh thought, and a field that cleared itself would
   * make the second ask cost as much as the first.
   */
  const draw = async () => {
    if (!drawing || !prompt.trim() || drawingNow) {
      return;
    }
    setDrawingNow(true);
    try {
      setDrawn(await drawing.draw({prompt: prompt.trim(), count: DRAW_COUNT}));
    } catch {
      // Abandoned, or the transport failed. Either way there is nothing new
      // to show and what was already there is still worth looking at.
      setDrawn([]);
    } finally {
      setDrawingNow(false);
    }
  };

  /** Keep one: the caller writes it, and it becomes this actor's picture. */
  const keep = async (picture: GeneratedPicture) => {
    const file = await onKeep?.(picture);
    if (file) {
      setLook({kind: 'sprite', value: file});
      // Gone from the tray once it is in the project: it is one of the
      // pictures above now, and showing it in both places would be saying it
      // was two things.
      setDrawn([]);
    }
  };

  /** Give the actor being built the chosen ability, and stay for another. */
  const add = () => {
    if (!addable || !chosen || !built || !target) {
      return;
    }
    setBuilt({
      ...built,
      source: chosen.apply(built.source, target, answer),
    });
    // Cleared, so the row the learner just pressed is not still pressed while
    // it reads "Already has this" — and so the next press is a fresh choice.
    setChosen(null);
    setAnswer(undefined);
  };

  const go = async () => {
    if (!ready || busy) {
      return;
    }
    if (!last) {
      // Built on the way in, and rebuilt if the answers behind it changed:
      // walking back to rename the actor and forward again must not leave the
      // abilities step editing the actor that was.
      if (STEPS[at + 1].id === 'abilities') {
        setBuilt(build({origin, source, name: chosenName, look}));
        setChosen(null);
        setAnswer(undefined);
      }
      setAt(step => step + 1);
      return;
    }
    if (!built) {
      return;
    }
    setBusy(true);
    // Left up on failure rather than closed: the caller's complaint is on
    // screen by then (a name already taken, a write refused), and a wizard
    // that vanished would take the answers with it.
    const made = await onCreate(built.source);
    setBusy(false);
    if (made) {
      onCancel();
    }
  };

  /** What the chosen door asks next, as tiles. */
  const choices =
    origin === 'copy'
      ? actors.map(one => ({
          value: one.fileId,
          name: one.name,
          picture: one.picture,
          title: one.name,
        }))
      : origin === 'template'
        ? templates.map(one => ({
            value: one.id,
            name: one.name,
            picture: undefined,
            title: `${one.name} — ${one.description}`,
          }))
        : [];

  return (
    <Dialog
      // A place to make something, not a warning that interrupts — the same
      // note every picker in this lab carries about `Dialog`'s default role.
      role="dialog"
      title="New actor"
      description="A few questions, and you can change every answer afterwards."
      onClose={onCancel}
      closeLabel="Close"
      primaryButtonProps={{
        children: busy ? 'Making…' : last ? 'Create' : 'Next',
        disabled: !ready || busy,
        onClick: () => void go(),
      }}
      secondaryButtonProps={{
        children: at === 0 ? 'Cancel' : 'Back',
        onClick: at === 0 ? onCancel : () => setAt(step => step - 1),
      }}
      customContent={
        <div className={styles.body}>
          <Typography variant="body4" className={styles.progress}>
            {`Step ${at + 1} of ${STEPS.length} — ${STEPS[at].title}`}
          </Typography>

          {STEPS[at].id === 'origin' && (
            <>
              <ul className={styles.doors}>
                {DOORS.map(door => (
                  <li key={door.kind} style={{display: 'contents'}}>
                    <button
                      type="button"
                      className={
                        origin === door.kind
                          ? `${styles.door} ${styles.doorChosen}`
                          : styles.door
                      }
                      aria-pressed={origin === door.kind}
                      onClick={() => {
                        setOrigin(door.kind);
                        // The other door's answer is not this one's. Kept, and the
                        // wizard would offer a stock id as a file to clone.
                        setSource(undefined);
                      }}
                    >
                      <Typography variant="body3" className={styles.doorName}>
                        {door.name}
                      </Typography>
                      <Typography variant="body4" className={styles.doorWhat}>
                        {door.what}
                      </Typography>
                    </button>
                  </li>
                ))}
              </ul>

              {origin !== undefined && origin !== 'new' && (
                <>
                  <ul className={styles.choices}>
                    {choices.map(choice => (
                      <li key={choice.value}>
                        <button
                          type="button"
                          className={
                            source === choice.value
                              ? `${styles.choice} ${styles.choiceChosen}`
                              : styles.choice
                          }
                          aria-pressed={source === choice.value}
                          aria-label={choice.name}
                          title={choice.title}
                          onClick={() => setSource(choice.value)}
                        >
                          <span className={styles.picture}>
                            {choice.picture ? (
                              <img src={choice.picture} alt="" />
                            ) : (
                              <span
                                className={styles.initial}
                                aria-hidden="true"
                              >
                                {choice.name.trim().charAt(0).toUpperCase()}
                              </span>
                            )}
                          </span>
                          <Typography
                            variant="body4"
                            className={styles.choiceName}
                          >
                            {choice.name}
                          </Typography>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {choices.length === 0 && (
                    <Typography variant="body4" className={styles.empty}>
                      {origin === 'copy'
                        ? 'This project has no actors to copy yet.'
                        : 'There are no templates to start from.'}
                    </Typography>
                  )}
                </>
              )}

              {origin !== undefined && (
                <label className={styles.field}>
                  <Typography variant="body4">Called</Typography>
                  <input
                    className={styles.name}
                    value={name}
                    placeholder={suggested || 'Chaser'}
                    onChange={event => setName(event.target.value)}
                  />
                  {problem && (
                    <Typography variant="body4" className={styles.problem}>
                      {problem}
                    </Typography>
                  )}
                </label>
              )}
            </>
          )}

          {STEPS[at].id === 'look' && (
            <>
              <ul className={styles.choices}>
                {/* THE PICTURES FIRST, then the animations, which is the order
                    a project holds them in and the order a learner meets them:
                    a still is what most actors are. */}
                {sprites.map(sprite => {
                  const image = images[sprite];
                  const chosen =
                    showing?.kind === 'sprite' && showing.value === sprite;
                  return (
                    <li key={`sprite:${sprite}`}>
                      <button
                        type="button"
                        className={
                          chosen
                            ? `${styles.choice} ${styles.choiceChosen}`
                            : styles.choice
                        }
                        aria-pressed={chosen}
                        aria-label={sprite}
                        title={sprite}
                        onClick={() => setLook({kind: 'sprite', value: sprite})}
                      >
                        <span className={styles.picture}>
                          {image && (
                            <CellThumb
                              image={image}
                              cell={{
                                x: 0,
                                y: 0,
                                width: image.width,
                                height: image.height,
                              }}
                              scale={
                                TILE / Math.max(image.width, image.height, 1)
                              }
                            />
                          )}
                        </span>
                        <Typography
                          variant="body4"
                          className={styles.choiceName}
                        >
                          {sprite.replace(/\.[^.]+$/, '')}
                        </Typography>
                      </button>
                    </li>
                  );
                })}
                {animations.map(one => {
                  const chosen =
                    showing?.kind === 'animation' && showing.value === one.id;
                  return (
                    <li key={`animation:${one.id}`}>
                      <button
                        type="button"
                        className={
                          chosen
                            ? `${styles.choice} ${styles.choiceChosen}`
                            : styles.choice
                        }
                        aria-pressed={chosen}
                        aria-label={one.name}
                        title={one.name}
                        onClick={() =>
                          setLook({kind: 'animation', value: one.id})
                        }
                      >
                        <span className={styles.picture}>
                          {one.animation && one.animation.frames.length > 0 && (
                            <AnimationThumb
                              animation={one.animation}
                              images={images}
                            />
                          )}
                        </span>
                        <Typography
                          variant="body4"
                          className={styles.choiceName}
                        >
                          {one.name}
                        </Typography>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {sprites.length === 0 && animations.length === 0 && (
                <Typography variant="body4" className={styles.empty}>
                  This project has no pictures yet. You can give it one
                  afterwards.
                </Typography>
              )}
              {showing === undefined && (
                <Typography variant="body4" className={styles.empty}>
                  Or none — an actor that paints itself needs no picture.
                </Typography>
              )}

              {drawing && (
                <>
                  {/* UNDER the grid, not beside it: describing one is another
                      way of answering the same question, and the pictures a
                      project already holds are the likelier answer. */}
                  <div className={styles.describe}>
                    <Typography variant="body4">Or describe one:</Typography>
                    <input
                      className={styles.prompt}
                      value={prompt}
                      placeholder="a purple crab"
                      aria-label="Describe a picture"
                      onChange={event => setPrompt(event.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.draw}
                      disabled={!prompt.trim() || drawingNow}
                      onClick={() => void draw()}
                    >
                      <Typography variant="body3">
                        {drawingNow ? 'Drawing…' : 'Draw'}
                      </Typography>
                    </button>
                  </div>
                  {drawn.length > 0 && (
                    <div className={styles.drawn}>
                      <Typography variant="body4" className={styles.drawnNote}>
                        Press one to keep it, or ask again.
                      </Typography>
                      <ul className={styles.choices}>
                        {drawn.map(picture => (
                          <li key={picture.dataUrl}>
                            <button
                              type="button"
                              className={styles.choice}
                              aria-label={`Keep ${picture.name}`}
                              title={picture.name}
                              onClick={() => void keep(picture)}
                            >
                              <span className={styles.picture}>
                                <img src={picture.dataUrl} alt="" />
                              </span>
                              <Typography
                                variant="body4"
                                className={styles.choiceName}
                              >
                                {picture.name}
                              </Typography>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {STEPS[at].id === 'abilities' && built && target && (
            <>
              <EnhancementRows
                source={built.source}
                target={target}
                chosen={chosen}
                answer={answer}
                onChoose={enhancement => {
                  setChosen(enhancement);
                  setAnswer(undefined);
                }}
                onAnswer={setAnswer}
              />
              {/* ADD, and stay. The rows read the actor being built, so the
                one just added says "Already has this" on the next render
                with nothing keeping count (`enhance/EnhancementRows`). */}
              <button
                type="button"
                className={styles.add}
                disabled={!addable}
                onClick={add}
              >
                <Typography variant="body3">Add this</Typography>
              </button>
            </>
          )}
        </div>
      }
    />
  );
};

export default ActorCreator;
