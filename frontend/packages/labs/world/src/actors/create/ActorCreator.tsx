// The Actor Creator: the frame, and the first question it asks.
//
// `New actor` asked for a name and wrote `define actor named ⟨Chaser⟩` and
// nothing else, leaving everything that makes it an actor to a learner who had
// to know four separate things first (specs/ACTOR_CREATION_WIZARD.md). This is
// the frame that asks them instead — a sequence of steps, each a question with
// a visible answer, ending in a file worth opening.
//
// WHAT IS HERE IS THE SHELL AND STEP ONE. The picture and the abilities are
// steps two and three, and both are content that today lives inside a dialog
// of its own (`animationEditor/SpritePickerDialog`,
// `enhance/EnhanceActorDialog`): a dialog cannot be nested in a dialog, so
// each has to be lifted out of its own `Dialog` wrapper before it can stand in
// a step. That is its own change; the step machinery here is written for it
// and is what `STEPS` is a list rather than a boolean.
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
// IT WRITES AT THE END OF STEP ONE, which is the spec's rule and is forced by
// two of the three doors: cloning writes a file and importing writes several,
// so there is no version of this where all three doors defer alike. The caller
// does the writing and says whether it worked; this waits.

import {Typography} from '@mui/material';
import {useMemo, useState} from 'react';

import {Dialog} from '@code-dot-org/component-library/dialog';

import styles from './actorCreator.module.css';

/** Where a new actor comes from. */
export type OriginKind = 'new' | 'copy' | 'template';

/** One actor the project already has, offered to be copied. */
export interface CopyableActor {
  /** The file to clone. */
  fileId: string;
  name: string;
  /** A picture to draw it by, where the registries have one. */
  picture?: string;
}

/** One actor the library offers to start from. */
export interface ActorTemplate {
  /** Its stock id, which is what an import is asked for by. */
  id: string;
  name: string;
  description: string;
}

/** What step one comes to: where it comes from, what it is called. */
export interface ActorDraft {
  origin: OriginKind;
  /** The file to clone, for `copy`; the stock id, for `template`. */
  source?: string;
  name: string;
}

export interface ActorCreatorProps {
  actors: readonly CopyableActor[];
  templates: readonly ActorTemplate[];
  /**
   * Whether a name may be used — the caller's rule, not this dialog's.
   *
   * The same check `New actor` makes, which knows about the project's files
   * and about what a file name may be (`files/FileMenus.nameProblem`). Returns
   * the complaint, or nothing when the name is fine.
   */
  nameProblem?: (name: string) => string | undefined;
  /**
   * Make it. Answers whether it worked, because this cannot tell: the caller
   * writes the files and the lab's reconcile gets the last word.
   */
  onCreate: (draft: ActorDraft) => Promise<boolean> | boolean;
  onCancel: () => void;
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
const STEPS = [{id: 'origin', title: 'Where does it come from?'}] as const;

export const ActorCreator = ({
  actors,
  templates,
  nameProblem,
  onCreate,
  onCancel,
}: ActorCreatorProps) => {
  const [at, setAt] = useState(0);
  const [origin, setOrigin] = useState<OriginKind>();
  const [source, setSource] = useState<string>();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

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

  const chosenName = name.trim() || suggested;
  const problem = chosenName ? nameProblem?.(chosenName) : undefined;

  /** Whether this step has been answered well enough to leave. */
  const ready =
    origin !== undefined &&
    (origin === 'new' || source !== undefined) &&
    chosenName.length > 0 &&
    problem === undefined;

  const last = at === STEPS.length - 1;

  const go = async () => {
    if (!ready || busy) {
      return;
    }
    if (!last) {
      setAt(step => step + 1);
      return;
    }
    setBusy(true);
    // Left up on failure rather than closed: the caller's complaint is on
    // screen by then (a name already taken, a write refused), and a wizard
    // that vanished would take the answers with it.
    const made = await onCreate({origin, source, name: chosenName});
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
                          <span className={styles.initial} aria-hidden="true">
                            {choice.name.trim().charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <Typography variant="body4" className={styles.choiceName}>
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
        </div>
      }
    />
  );
};

export default ActorCreator;
