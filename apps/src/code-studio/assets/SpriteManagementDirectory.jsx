import React, {useState} from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {moveDefaultSpriteMetadataToProduction} from '@cdo/apps/assetManagement/animationLibraryApi';
import StatusIcon, {
  iconStatus
} from '@cdo/apps/code-studio/components/StatusIcon';

export default function SpriteManagementDirectory() {
  const [moveChangesStatus, setMoveChangesStatus] = useState(iconStatus.none);

  const moveChangesToProduction = () => {
    //Files to move to production folder: defaultSprites.json
    moveDefaultSpriteMetadataToProduction()
      .then(() => {
        setMoveChangesStatus(iconStatus.success);
      })
      .catch(err => {
        setMoveChangesStatus(iconStatus.failure);
        console.log(err);
      });
  };

  const confirmReleaseChangesToLevelbuilder = () => {
    let shouldRelease = confirm(
      'This will release all the sprites you have added and updates to the default sprite list to ' +
        'production. Are you sure?'
    );
    if (shouldRelease) {
      moveChangesToProduction();
    }
  };

  return (
    <div>
      <h1>Manage Sprite Lab Assets</h1>
      <p>This is an internal set of tools for Code.org content authors.</p>
      <h2>New Animations</h2>
      <ul>
        <li>
          <a href="/sprites/sprite_upload">Upload New Animations</a>
        </li>
      </ul>
      <p>
        <br />
        Make new costumes and backgrounds available in Sprite Lab projects and
        curriculum levels.
      </p>
      <h2>Animation JSON</h2>
      <ul>
        <li>
          <a href="/sprites/select_start_animations">
            Generate Animation JSON From Library Animations only
          </a>
        </li>
        <li>
          <a href="/sprites/select_start_animations?library=all">
            Generate Animation JSON From Library AND Level-Specific Animations
          </a>{' '}
          (Slower)
        </li>
      </ul>
      <p>
        <br />
        For level builders. Generate Animation JSON that can be copied and
        pasted into curriculum levels.
      </p>
      <h2>Default Animations</h2>
      <ul>
        <li>
          <a href="/sprites/default_sprites_editor">
            Edit Default Costumes and Backgrounds
          </a>
        </li>
        <li>
          <a href="/sprites/release_default_sprites_to_production">
            Release Changes to Default Animations to Production
          </a>
        </li>
      </ul>
      <p>
        <br />
        Updates the default set of costumes and backgrounds featured in most
        Sprite Lab projects. 'Edit Default Costumes and Backgrounds' saves
        changes to the Default list on LevelBuilder, until you 'Release Changes
        to Default Animations to Production'.
      </p>
      <div style={styles.pageBreak}>
        <Button
          text="Release Changes to Production"
          color={Button.ButtonColor.red}
          onClick={confirmReleaseChangesToLevelbuilder}
          style={styles.button}
        />
        <StatusIcon status={moveChangesStatus} />
      </div>
    </div>
  );
}

const styles = {
  pageBreak: {
    borderTop: `1px solid ${color.dark_slate_gray}`,
    display: 'flex',
    alignItems: 'start'
  },
  button: {
    margin: 20,
    fontSize: 20
  }
};
