import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {useSetupBlockColor} from '@cdo/apps/blockly/utils/useSetupBlockColor';
import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneLink} from '../sceneLinks';
import {SceneType} from '../types';

import NewSceneDialog, {SCENE_NAME_MAX_LENGTH} from './NewSceneDialog';
import ScenePicture from './ScenePicture';

import moduleStyles from './sprite-lab2-view.module.scss';

interface SceneCardProps {
  scene: SceneMetadata;
  active: boolean;
  /** The first scene: where Play and other projects' jumps begin. */
  startsHere: boolean;
  /** The last scene can't be deleted: a project always has one. */
  deletable: boolean;
  editable: boolean;
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
  onOpen,
  onRename,
  onDelete,
  onMakeStart,
  register,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(scene.name);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.select();
    }
  }, [renaming]);

  const commitRename = useCallback(() => {
    const name = draft.trim();
    if (name && name !== scene.name) {
      onRename(scene.id, name);
    }
    setRenaming(false);
  }, [draft, scene.id, scene.name, onRename]);

  const startRename = () => {
    setDraft(scene.name);
    setRenaming(true);
  };

  return (
    <div
      ref={element => register(scene.id, element)}
      className={classNames(
        moduleStyles.sceneCard,
        active && moduleStyles.sceneCardActive
      )}
    >
      <button
        type="button"
        className={moduleStyles.sceneTile}
        aria-label={`Open ${scene.name}`}
        onClick={() => onOpen(scene.id)}
      >
        <ScenePicture
          src={scene.thumbnail}
          className={moduleStyles.sceneTilePicture}
        />
        {startsHere && (
          <span className={moduleStyles.sceneStartBadge}>Starts here</span>
        )}
      </button>
      {/* The image dialog's rename: a pencil beside the name swaps in a
          field with save and cancel. */}
      <div className={moduleStyles.sceneNameRow}>
        {renaming ? (
          <>
            <TextField
              ref={inputRef}
              name="sceneName"
              aria-label="Scene name"
              className={moduleStyles.sceneNameField}
              size="s"
              value={draft}
              maxLength={SCENE_NAME_MAX_LENGTH}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  commitRename();
                } else if (e.key === 'Escape') {
                  setRenaming(false);
                }
              }}
            />
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="small"
              className={moduleStyles.sceneNameIconButton}
              aria-label="Save name"
              disabled={!draft.trim()}
              onClick={commitRename}
            >
              <FontAwesomeV6Icon iconName="check" />
            </MuiIconButton>
            <MuiIconButton
              variant="text"
              color="tertiary"
              size="small"
              className={moduleStyles.sceneNameIconButton}
              aria-label="Cancel rename"
              onClick={() => setRenaming(false)}
            >
              <FontAwesomeV6Icon iconName="xmark" />
            </MuiIconButton>
          </>
        ) : (
          <>
            <span className={moduleStyles.sceneName}>{scene.name}</span>
            {editable && (
              <MuiIconButton
                variant="text"
                color="tertiary"
                size="small"
                className={moduleStyles.sceneNameIconButton}
                aria-label={`Rename ${scene.name}`}
                onClick={startRename}
              >
                <FontAwesomeV6Icon iconName="pencil" />
              </MuiIconButton>
            )}
          </>
        )}
      </div>
      {editable && !startsHere && (
        <MuiButton
          variant="outlined"
          color="secondary"
          size="extraSmall"
          fullWidth
          onClick={() => onMakeStart(scene.id)}
        >
          Start here
        </MuiButton>
      )}
      {editable && deletable && (
        <div className={moduleStyles.sceneCardFooter}>
          {confirming ? (
            <>
              <span className={moduleStyles.sceneDeleteQuestion}>
                Delete this scene?
              </span>
              <div className={moduleStyles.sceneDeleteChoices}>
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
            </>
          ) : (
            <MuiButton
              variant="outlined"
              color="secondary"
              size="extraSmall"
              fullWidth
              onClick={() => setConfirming(true)}
            >
              Delete
            </MuiButton>
          )}
        </div>
      )}
    </div>
  );
};

interface ScenesGalleryProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** Whether scenes can be added, renamed, reordered and deleted here. */
  editable: boolean;
  /** Which scenes' code jumps to which, drawn as arrows between cards. */
  links?: SceneLink[];
  onOpenScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  onRenameScene: (sceneId: string, name: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onMakeStartScene: (sceneId: string) => void;
  /** Plays the game from its start scene. */
  onPlayGame?: (event: React.MouseEvent<HTMLElement>) => void;
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

// An arrow's path between two cards, in the map's coordinates: out of the
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

/**
 * The scenes map: every scene as a card (picture, name, actions), in play
 * order, with a "new scene" card first, arrows between the cards whose
 * code jumps between them, and Play game above. Opening a card goes to
 * that scene's code.
 */
const ScenesGallery: React.FunctionComponent<ScenesGalleryProps> = ({
  scenes,
  activeSceneId,
  editable,
  links = NO_LINKS,
  onOpenScene,
  onCreateScene,
  onRenameScene,
  onDeleteScene,
  onMakeStartScene,
  onPlayGame,
}) => {
  const [naming, setNaming] = useState(false);
  // Play game wears the Play buttons' colour (see PlayBar).
  const setupBlockColor = useSetupBlockColor();
  // The cards' boxes in the map's coordinates, remeasured when the map's
  // size or the cards change.
  const mapRef = useRef<HTMLDivElement>(null);
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
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const origin = map.getBoundingClientRect();
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
  useLayoutEffect(measure, [measure, scenes, links]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(map);
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
    <div className={moduleStyles.scenesMap}>
      {onPlayGame && (
        <div className={moduleStyles.scenesMapHeader}>
          <MuiButton
            variant="contained"
            color="primary"
            size="small"
            sx={getRunButtonSx(setupBlockColor)}
            startIcon={<FontAwesomeV6Icon iconName="play" />}
            onClick={onPlayGame}
          >
            Play game
          </MuiButton>
        </div>
      )}
      <div ref={mapRef} className={moduleStyles.imageGallery}>
        {arrows.length > 0 && (
          <svg className={moduleStyles.sceneLinks} aria-hidden>
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
        {editable && (
          <div className={moduleStyles.sceneCard}>
            <button
              type="button"
              className={moduleStyles.newSceneCard}
              onClick={() => setNaming(true)}
            >
              <span aria-hidden>+</span>
              <span className={moduleStyles.newImageLabel}>New scene</span>
            </button>
          </div>
        )}
        {scenes.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            active={scene.id === activeSceneId}
            startsHere={index === 0}
            deletable={scenes.length > 1}
            editable={editable}
            onOpen={onOpenScene}
            onRename={onRenameScene}
            onDelete={onDeleteScene}
            onMakeStart={onMakeStartScene}
            register={register}
          />
        ))}
        {naming && (
          <NewSceneDialog
            onCreate={onCreateScene}
            onClose={() => setNaming(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ScenesGallery;
