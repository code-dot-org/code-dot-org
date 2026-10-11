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
  /** The open scene's two editors, as segments inside its tab; absent
      where the scene has only one. */
  editor?: {value: Editor; onChange: (editor: Editor) => void};
}

export type Editor = 'World' | 'Code';

const EDITORS: {editor: Editor; icon: string}[] = [
  {editor: 'World', icon: 'table-cells'},
  {editor: 'Code', icon: 'code'},
];

/**
 * The project's scenes as a row of tabs, each with its picture, so the
 * scenes are in sight rather than inside a menu. "All scenes" at the head
 * goes back up to the map, and is gone while the map is open; the open
 * scene's tab holds its World | Code switch, so the choice sits inside
 * the scene it is about. Overflow hides under the row's end; the selected
 * tab scrolls into view.
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
  editor,
}) => {
  const [naming, setNaming] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
  }, [activeSceneId, scenes.length]);
  return (
    <div className={moduleStyles.sceneTabs} role="tablist" aria-label="Scenes">
      {onManageScenes && !galleryOpen && (
        <button
          type="button"
          disabled={disabled}
          className={moduleStyles.sceneTabBack}
          onClick={event => {
            blurAfterPointerClick(event);
            onManageScenes();
          }}
        >
          <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
          <span className={moduleStyles.sceneTabName} data-label="All scenes">
            All scenes
          </span>
        </button>
      )}
      <div className={moduleStyles.sceneTabsRow}>
        {scenes.map(scene => {
          const selected = !galleryOpen && scene.id === activeSceneId;
          const open = selected && !!editor;
          return (
            <div
              key={scene.id}
              className={classNames(
                moduleStyles.sceneTab,
                selected && moduleStyles.sceneTabActive,
                open && moduleStyles.sceneTabOpen
              )}
            >
              <button
                ref={selected ? activeRef : undefined}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={disabled}
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
                <span
                  className={moduleStyles.sceneTabName}
                  data-label={scene.name}
                >
                  {scene.name}
                </span>
              </button>
              {open && editor && (
                <div
                  className={moduleStyles.sceneTabEditors}
                  role="group"
                  aria-label="Edit"
                >
                  {EDITORS.map(({editor: choice, icon}) => (
                    <button
                      key={choice}
                      type="button"
                      aria-pressed={editor.value === choice}
                      disabled={disabled}
                      className={classNames(
                        moduleStyles.sceneTabEditor,
                        editor.value === choice &&
                          moduleStyles.sceneTabEditorActive
                      )}
                      onClick={event => {
                        blurAfterPointerClick(event);
                        editor.onChange(choice);
                      }}
                    >
                      <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
                      {choice}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
