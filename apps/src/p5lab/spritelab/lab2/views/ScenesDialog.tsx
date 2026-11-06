// All scenes: a dialog of every scene as a card in play order. Edits land
// as they are made; Done only closes. A new scene is named before it
// exists: its card appears with the name field open, and cancelling the
// name drops it.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';

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
  // control. Without scrolling: a new card scrolls itself whole into view,
  // and the focus would otherwise bring just the field.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus({preventScroll: true});
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
  /** The first scene: where Play and other projects' jumps begin. */
  startsHere: boolean;
  /** The last scene can't be deleted: a project always has one. */
  deletable: boolean;
  editable: boolean;
  /** Held still while another scene is being named. */
  disabled: boolean;
  onRename: (sceneId: string, name: string) => void;
  onDelete: (sceneId: string) => void;
  onMakeStart: (sceneId: string) => void;
}

const SceneCard: React.FunctionComponent<SceneCardProps> = ({
  scene,
  startsHere,
  deletable,
  editable,
  disabled,
  onRename,
  onDelete,
  onMakeStart,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <div className={classNames(styles.card, disabled && styles.cardDisabled)}>
      <div className={styles.tile}>
        <ScenePicture src={scene.thumbnail} className={styles.tilePicture} />
      </div>
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
          {/* The start scene wears a mark in the button's place: there is
              nothing to press. */}
          {!confirming &&
            (startsHere ? (
              <span className={styles.startsHere}>
                <FontAwesomeV6Icon iconName="play" aria-hidden />
                Starts here
              </span>
            ) : (
              <MuiButton
                variant="outlined"
                color="secondary"
                size="extraSmall"
                startIcon={<FontAwesomeV6Icon iconName="play" aria-hidden />}
                disabled={disabled}
                onClick={() => onMakeStart(scene.id)}
              >
                Start here
              </MuiButton>
            ))}
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
  // The whole card into view: it lands at the end, which may be below
  // the fold.
  useEffect(() => {
    ref.current?.scrollIntoView?.({block: 'nearest'});
  }, []);
  return (
    <div ref={ref} className={classNames(styles.card, styles.cardNew)}>
      <div className={styles.tile}>
        <ScenePicture src={undefined} className={styles.tilePicture} />
      </div>
      <div className={styles.nameRow}>
        <SceneNameField initial="" onCommit={onCreate} onCancel={onCancel} />
      </div>
      {/* Where the buttons will be, so the card is already its full
          height. */}
      <div className={styles.cardActions} aria-hidden />
    </div>
  );
};

interface ScenesDialogProps {
  scenes: SceneMetadata[];
  /** Whether scenes can be added, renamed, reordered and deleted here. */
  editable: boolean;
  /** Opens with a new scene waiting for its name. */
  creating?: boolean;
  onCreateScene: (name: string) => void;
  onRenameScene: (sceneId: string, name: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onMakeStartScene: (sceneId: string) => void;
  onClose: () => void;
}

const ScenesDialog: React.FunctionComponent<ScenesDialogProps> = ({
  scenes,
  editable,
  creating = false,
  onCreateScene,
  onRenameScene,
  onDeleteScene,
  onMakeStartScene,
  onClose,
}) => {
  const [naming, setNaming] = useState(creating);
  return (
    <MuiDialog
      title={TITLE}
      className={styles.dialog}
      onClose={onClose}
      customContent={
        <>
          <p id="dsco-dialog-description" className={styles.srOnly}>
            Every scene of the game in play order. Changes are kept as they are
            made.
          </p>
          <div className={styles.body}>
            <div className={styles.grid}>
              {scenes.map((scene, index) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  startsHere={index === 0}
                  deletable={scenes.length > 1}
                  editable={editable}
                  disabled={naming}
                  onRename={onRenameScene}
                  onDelete={onDeleteScene}
                  onMakeStart={onMakeStartScene}
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
        </>
      }
      secondaryButtonProps={
        editable
          ? {
              children: 'New scene',
              startIcon: <FontAwesomeV6Icon iconName="plus" aria-hidden />,
              disabled: naming,
              onClick: () => setNaming(true),
            }
          : undefined
      }
      primaryButtonProps={{
        children: 'Done',
        disabled: naming,
        onClick: onClose,
      }}
    />
  );
};

export default ScenesDialog;
