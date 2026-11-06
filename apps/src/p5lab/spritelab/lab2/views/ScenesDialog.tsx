// All scenes: a dialog of every scene as a card in play order, with arrows
// between the cards whose code jumps between them. Edits land as they are
// made; Done only closes. A new scene is named before it exists: its card
// appears with the name field open, and cancelling the name drops it.

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneLink} from '../sceneLinks';

import ScenePicture from './ScenePicture';

import styles from './scenes-dialog.module.scss';

export const SCENE_NAME_MAX_LENGTH = 40;
const TITLE = 'All scenes';

interface SceneNameFieldProps {
  initial: string;
  /** Called with the trimmed name, never blank. */
  onCommit: (name: string) => void;
  onCancel: () => void;
}

/** A scene's name being typed, with save and cancel beside it. */
const SceneNameField: React.FunctionComponent<SceneNameFieldProps> = ({
  initial,
  onCommit,
  onCancel,
}) => {
  const [draft, setDraft] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  // Deferred past the dialog's own mount, which puts focus on its first
  // control.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.clearTimeout(timer);
  }, []);
  const name = draft.trim();
  const commit = () => {
    if (name) {
      onCommit(name);
    }
  };
  return (
    <>
      <TextField
        ref={inputRef}
        name="sceneName"
        aria-label="Scene name"
        className={styles.nameField}
        size="s"
        value={draft}
        maxLength={SCENE_NAME_MAX_LENGTH}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            commit();
          } else if (e.key === 'Escape') {
            // The field's escape, not the dialog's.
            e.stopPropagation();
            onCancel();
          }
        }}
      />
      <MuiIconButton
        variant="text"
        color="tertiary"
        size="small"
        className={styles.nameIconButton}
        aria-label="Save name"
        disabled={!name}
        onClick={commit}
      >
        <FontAwesomeV6Icon iconName="check" />
      </MuiIconButton>
      <MuiIconButton
        variant="text"
        color="tertiary"
        size="small"
        className={styles.nameIconButton}
        aria-label="Cancel name"
        onClick={onCancel}
      >
        <FontAwesomeV6Icon iconName="xmark" />
      </MuiIconButton>
    </>
  );
};

interface SceneCardProps {
  scene: SceneMetadata;
  active: boolean;
  /** The first scene: where Play and other projects' jumps begin. */
  startsHere: boolean;
  /** The last scene can't be deleted: a project always has one. */
  deletable: boolean;
  editable: boolean;
  /** Held still while another scene is being named. */
  disabled: boolean;
  onOpen: (sceneId: string) => void;
  onRename: (sceneId: string, name: string) => void;
  onDelete: (sceneId: string) => void;
  onMakeStart: (sceneId: string) => void;
  /** The card's element, for the arrows drawn between cards. */
  register: (sceneId: string, element: HTMLDivElement | null) => void;
}

const SceneCard: React.FunctionComponent<SceneCardProps> = ({
  scene,
  active,
  startsHere,
  deletable,
  editable,
  disabled,
  onOpen,
  onRename,
  onDelete,
  onMakeStart,
  register,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      ref={element => register(scene.id, element)}
      className={classNames(
        styles.card,
        active && styles.cardActive,
        disabled && styles.cardDisabled
      )}
    >
      <button
        type="button"
        className={styles.tile}
        aria-label={`Open ${scene.name}`}
        disabled={disabled}
        onClick={() => onOpen(scene.id)}
      >
        <ScenePicture src={scene.thumbnail} className={styles.tilePicture} />
      </button>
      <div className={styles.nameRow}>
        {renaming ? (
          <SceneNameField
            initial={scene.name}
            onCommit={name => {
              if (name !== scene.name) {
                onRename(scene.id, name);
              }
              setRenaming(false);
            }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <>
            <span className={styles.name}>{scene.name}</span>
            {editable && (
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                className={styles.nameIconButton}
                aria-label={`Rename ${scene.name}`}
                disabled={disabled}
                onClick={() => setRenaming(true)}
              >
                <FontAwesomeV6Icon iconName="pencil" />
              </MuiIconButton>
            )}
          </>
        )}
      </div>
      {editable && (
        <div className={styles.cardActions}>
          {deletable &&
            (confirming ? (
              <div className={styles.deleteConfirm}>
                <span className={styles.deleteQuestion}>
                  Delete this scene?
                </span>
                <div className={styles.deleteChoices}>
                  <MuiButton
                    variant="contained"
                    color="error"
                    size="extraSmall"
                    fullWidth
                    onClick={() => onDelete(scene.id)}
                  >
                    Delete
                  </MuiButton>
                  <MuiButton
                    variant="outlined"
                    color="secondary"
                    size="extraSmall"
                    fullWidth
                    onClick={() => setConfirming(false)}
                  >
                    Keep
                  </MuiButton>
                </div>
              </div>
            ) : (
              <MuiButton
                variant="outlined"
                color="error"
                size="extraSmall"
                startIcon={<FontAwesomeV6Icon iconName="trash" aria-hidden />}
                disabled={disabled}
                onClick={() => setConfirming(true)}
              >
                Delete
              </MuiButton>
            ))}
          {!confirming && (
            <MuiButton
              variant={startsHere ? 'contained' : 'outlined'}
              color={startsHere ? 'primary' : 'secondary'}
              size="extraSmall"
              aria-pressed={startsHere}
              startIcon={<FontAwesomeV6Icon iconName="play" aria-hidden />}
              disabled={disabled}
              onClick={() => {
                if (!startsHere) {
                  onMakeStart(scene.id);
                }
              }}
            >
              Start here
            </MuiButton>
          )}
        </div>
      )}
    </div>
  );
};

interface NewSceneCardProps {
  onCreate: (name: string) => void;
  onCancel: () => void;
}

/** The card of a scene that exists once it has a name. */
const NewSceneCard: React.FunctionComponent<NewSceneCardProps> = ({
  onCreate,
  onCancel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // Into view at the end of the row, which may be below the fold.
  useEffect(() => {
    ref.current?.scrollIntoView?.({block: 'nearest'});
  }, []);
  return (
    <div ref={ref} className={classNames(styles.card, styles.cardNew)}>
      <span className={classNames(styles.tile, styles.tileNew)}>
        <ScenePicture src={undefined} className={styles.tilePicture} />
      </span>
      <div className={styles.nameRow}>
        <SceneNameField initial="" onCommit={onCreate} onCancel={onCancel} />
      </div>
    </div>
  );
};

interface ScenesDialogProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** Whether scenes can be added, renamed, reordered and deleted here. */
  editable: boolean;
  /** Which scenes' code jumps to which, drawn as arrows between cards. */
  links?: SceneLink[];
  /** Opens with a new scene waiting for its name. */
  creating?: boolean;
  /** A scene was chosen from its tile; the dialog closes with it. */
  onOpenScene: (sceneId: string) => void;
  onCreateScene: (name: string) => void;
  onRenameScene: (sceneId: string, name: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onMakeStartScene: (sceneId: string) => void;
  onClose: () => void;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const NO_LINKS: SceneLink[] = [];

function sameRects(a: Map<string, Rect>, b: Map<string, Rect>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const [id, rect] of a) {
    const other = b.get(id);
    if (
      !other ||
      other.left !== rect.left ||
      other.top !== rect.top ||
      other.width !== rect.width ||
      other.height !== rect.height
    ) {
      return false;
    }
  }
  return true;
}

// An arrow's path between two cards, in the grid's coordinates: out of the
// right side into the left side when the target is to the right on the
// same row; otherwise out of the bottom (or top) into the top (or bottom).
function arrowPath(from: Rect, to: Rect): string {
  const sameRow = Math.abs(from.top - to.top) < from.height / 2;
  if (sameRow && to.left > from.left) {
    const x1 = from.left + from.width;
    const y1 = from.top + from.height / 2;
    const x2 = to.left;
    const y2 = to.top + to.height / 2;
    const bend = Math.max(16, (x2 - x1) / 2);
    return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
  }
  const down = to.top > from.top;
  const x1 = from.left + from.width / 2;
  const y1 = down ? from.top + from.height : from.top;
  const x2 = to.left + to.width / 2;
  const y2 = down ? to.top : to.top + to.height;
  const bend = Math.max(24, Math.abs(y2 - y1) / 2) * (down ? 1 : -1);
  return `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`;
}

const ScenesDialog: React.FunctionComponent<ScenesDialogProps> = ({
  scenes,
  activeSceneId,
  editable,
  links = NO_LINKS,
  creating = false,
  onOpenScene,
  onCreateScene,
  onRenameScene,
  onDeleteScene,
  onMakeStartScene,
  onClose,
}) => {
  const [naming, setNaming] = useState(creating);
  // The cards' boxes in the grid's coordinates, remeasured when the grid's
  // size or the cards change.
  const gridRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLDivElement>());
  const register = useCallback(
    (sceneId: string, element: HTMLDivElement | null) => {
      if (element) {
        cards.current.set(sceneId, element);
      } else {
        cards.current.delete(sceneId);
      }
    },
    []
  );
  const [rects, setRects] = useState<Map<string, Rect>>(new Map());
  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }
    const origin = grid.getBoundingClientRect();
    const next = new Map<string, Rect>();
    cards.current.forEach((element, sceneId) => {
      const box = element.getBoundingClientRect();
      next.set(sceneId, {
        left: box.left - origin.left,
        top: box.top - origin.top,
        width: box.width,
        height: box.height,
      });
    });
    // Unchanged boxes keep the state, or every render would remeasure.
    setRects(current => (sameRects(current, next) ? current : next));
  }, []);
  useLayoutEffect(measure, [measure, scenes, links, naming]);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [measure]);
  const arrows = links.flatMap(link => {
    const from = rects.get(link.from);
    const to = rects.get(link.to);
    return from && to
      ? [{key: `${link.from}->${link.to}`, d: arrowPath(from, to)}]
      : [];
  });
  return (
    <MuiCustomDialog
      aria-label={TITLE}
      className={styles.dialog}
      onClose={onClose}
    >
      <MuiTypography
        component="h2"
        variant="overline2"
        className={styles.title}
      >
        {TITLE}
      </MuiTypography>
      <p id="dsco-dialog-description" className={styles.srOnly}>
        Every scene of the game in play order. Changes are kept as they are
        made.
      </p>
      <div className={styles.body}>
        <div ref={gridRef} className={styles.grid}>
          {arrows.length > 0 && (
            <svg className={styles.links} aria-hidden>
              <defs>
                <marker
                  id="scene-link-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 z" />
                </marker>
              </defs>
              {arrows.map(arrow => (
                <path
                  key={arrow.key}
                  d={arrow.d}
                  markerEnd="url(#scene-link-arrow)"
                />
              ))}
            </svg>
          )}
          {scenes.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              active={scene.id === activeSceneId}
              startsHere={index === 0}
              deletable={scenes.length > 1}
              editable={editable}
              disabled={naming}
              onOpen={sceneId => {
                onOpenScene(sceneId);
                onClose();
              }}
              onRename={onRenameScene}
              onDelete={onDeleteScene}
              onMakeStart={onMakeStartScene}
              register={register}
            />
          ))}
          {naming && (
            <NewSceneCard
              onCreate={name => {
                onCreateScene(name);
                setNaming(false);
              }}
              onCancel={() => setNaming(false)}
            />
          )}
        </div>
      </div>
      <div className={styles.footer}>
        {editable && (
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            startIcon={<FontAwesomeV6Icon iconName="plus" aria-hidden />}
            disabled={naming}
            onClick={() => setNaming(true)}
          >
            New scene
          </MuiButton>
        )}
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          className={styles.done}
          disabled={naming}
          onClick={onClose}
        >
          Done
        </MuiButton>
      </div>
    </MuiCustomDialog>
  );
};

export default ScenesDialog;
