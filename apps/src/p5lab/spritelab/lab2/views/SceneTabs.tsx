import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneType} from '../types';

import {blurAfterPointerClick} from './blurAfterPointerClick';
import NewSceneDialog from './NewSceneDialog';
import ScenePicture from './ScenePicture';

import moduleStyles from './sprite-lab2-view.module.scss';

interface SceneTabsProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** The gallery is open: it is the selected tab, not a scene. */
  galleryOpen: boolean;
  /** While the game plays, switching scenes has no effect. */
  disabled?: boolean;
  /** The level keeps its student to the selected scene: the row still
      shows, so the full lab holds no surprises, but the way back, the
      other tabs and New scene are disabled, with the reason on hover. */
  locked?: boolean;
  lockedReason?: string;
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  /** Opens the Scenes gallery; the row offers it only when given. */
  onManageScenes?: () => void;
}

/**
 * The project's scenes as a row of tabs, each with its picture, so the
 * scenes are in sight rather than inside a menu, then New scene, then
 * "All scenes" up to the map, gone while the map is open. Overflow hides
 * under the row's end; the selected tab scrolls into view.
 */
const SceneTabs: React.FunctionComponent<SceneTabsProps> = ({
  scenes,
  activeSceneId,
  galleryOpen,
  disabled = false,
  locked = false,
  lockedReason,
  allowCreate = true,
  onSelectScene,
  onCreateScene,
  onManageScenes,
}) => {
  const [naming, setNaming] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
  }, [activeSceneId, scenes.length]);
  return (
    <div className={moduleStyles.sceneTabs}>
      <div
        className={moduleStyles.sceneTabsRow}
        role="tablist"
        aria-label="Scenes"
      >
        {scenes.map((scene, index) => {
          const selected = !galleryOpen && scene.id === activeSceneId;
          const startsHere = index === 0 && scenes.length > 1;
          return (
            <div
              key={scene.id}
              className={classNames(
                moduleStyles.sceneTab,
                selected && moduleStyles.sceneTabActive
              )}
            >
              <button
                ref={selected ? activeRef : undefined}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={disabled || (locked && !selected)}
                title={locked && !selected ? lockedReason : undefined}
                className={moduleStyles.sceneTabMain}
                onClick={event => {
                  blurAfterPointerClick(event);
                  onSelectScene(scene.id);
                }}
              >
                <ScenePicture
                  src={scene.thumbnail}
                  className={classNames(
                    moduleStyles.sceneThumb,
                    moduleStyles.sceneThumbSmall
                  )}
                />
                {startsHere && (
                  <span
                    className={moduleStyles.sceneTabStart}
                    title="The game starts here"
                    aria-hidden
                  >
                    <FontAwesomeV6Icon iconName="flag-checkered" />
                  </span>
                )}
                <span
                  className={moduleStyles.sceneTabName}
                  data-label={scene.name}
                >
                  {scene.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {allowCreate && (
        <button
          type="button"
          className={moduleStyles.sceneTabButton}
          aria-label="New scene"
          title={locked && lockedReason ? lockedReason : 'New scene'}
          disabled={disabled || locked}
          onClick={event => {
            blurAfterPointerClick(event);
            setNaming(true);
          }}
        >
          <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
        </button>
      )}
      {onManageScenes && !galleryOpen && (
        <button
          type="button"
          disabled={disabled || locked}
          title={locked ? lockedReason : undefined}
          className={moduleStyles.sceneTabBack}
          onClick={event => {
            blurAfterPointerClick(event);
            onManageScenes();
          }}
        >
          <span className={moduleStyles.sceneTabName} data-label="All scenes">
            All scenes
          </span>
        </button>
      )}
      {naming && (
        <NewSceneDialog
          onCreate={onCreateScene}
          onClose={() => setNaming(false)}
        />
      )}
    </div>
  );
};

export default SceneTabs;
