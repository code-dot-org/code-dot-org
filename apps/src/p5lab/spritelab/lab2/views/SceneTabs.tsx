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
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  /** Opens the Scenes gallery; the row offers it only when given. */
  onManageScenes?: () => void;
}

/**
 * The project's scenes as a row of tabs, each with its picture, so the
 * scenes are in sight rather than inside a menu. The row reads as a
 * breadcrumb: Scenes, the map of the whole game, then the scenes in it.
 * Overflow hides under the row's end; the selected tab scrolls into view.
 */
const SceneTabs: React.FunctionComponent<SceneTabsProps> = ({
  scenes,
  activeSceneId,
  galleryOpen,
  disabled = false,
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
    <div className={moduleStyles.sceneTabs} role="tablist" aria-label="Scenes">
      {onManageScenes && (
        <>
          <button
            type="button"
            role="tab"
            aria-selected={galleryOpen}
            disabled={disabled}
            className={classNames(
              moduleStyles.sceneTab,
              moduleStyles.sceneTabAll,
              galleryOpen && moduleStyles.sceneTabActive
            )}
            onClick={event => {
              blurAfterPointerClick(event);
              onManageScenes();
            }}
          >
            <FontAwesomeV6Icon iconName="table-cells" iconStyle="solid" />
            <span className={moduleStyles.sceneTabName} data-label="Scenes">
              Scenes
            </span>
          </button>
          <FontAwesomeV6Icon
            iconName="chevron-right"
            iconStyle="solid"
            className={moduleStyles.sceneTabsChevron}
          />
        </>
      )}
      <div className={moduleStyles.sceneTabsRow}>
        {scenes.map(scene => {
          const selected = !galleryOpen && scene.id === activeSceneId;
          return (
            <button
              key={scene.id}
              ref={selected ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={disabled}
              className={classNames(
                moduleStyles.sceneTab,
                selected && moduleStyles.sceneTabActive
              )}
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
              <span
                className={moduleStyles.sceneTabName}
                data-label={scene.name}
              >
                {scene.name}
              </span>
            </button>
          );
        })}
      </div>
      {allowCreate && (
        <button
          type="button"
          className={moduleStyles.sceneTabButton}
          aria-label="New scene"
          title="New scene"
          disabled={disabled}
          onClick={event => {
            blurAfterPointerClick(event);
            setNaming(true);
          }}
        >
          <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
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
