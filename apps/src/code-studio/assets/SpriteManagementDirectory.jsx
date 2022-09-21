import React, {useState} from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {moveDefaultSpriteMetadataToProduction} from '@cdo/apps/assetManagement/animationLibraryApi';
import StatusCheckmarkIcon, {
  iconStatus
} from '@cdo/apps/code-studio/components/StatusCheckmarkIcon';

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
      <h1>Manage Sprite Lab Sprites</h1>
      <h3>
        <a href="/sprites/sprite_upload">Upload New Sprites</a>
      </h3>
      <h3>
        <a href="/sprites/default_sprites_editor">Edit Default Sprites</a>
      </h3>
      <h3>
        <a href="/sprites/select_start_animations">
          Select Start Animations From Library
        </a>
      </h3>
      <div>
        <h1>Manage Sprite Lab Assets</h1>
        <p>This is an internal set of tools for Code.org content authors.</p>
        <h2>New Animations</h2>
        <li>
          <a href="/sprites/sprite_upload">Upload New Animations</a>
        </li>
        <p>
          <br />
          Make new costumes and backgrounds available in Sprite Lab projects and
          curriculum levels.
        </p>
        <h2>Animation JSON</h2>
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
        <p>
          <br />
          For level builders. Generate Animation JSON that can be copied and
          pasted into curriculum levels.
        </p>
        <h2>Default Animations</h2>
        <li>
          <a href="/sprites/default_sprites_editor">
            Edit Default Costumes and Backgrounds
          </a>
        </li>
        <p>
          <br />
          Updates the default set of costumes and backgrounds featured in most
          Sprite Lab projects.
        </p>
      </div>
      <div style={styles.pageBreak}>
        <Button
          text="Release Changes to Production"
          color={Button.ButtonColor.red}
          onClick={confirmReleaseChangesToLevelbuilder}
          style={styles.button}
        />
        <StatusCheckmarkIcon displayStatus={moveChangesStatus} />
      </div>
    </div>
  );
}

const styles = {
  pageBreak: {
    borderTop: `1px solid ${color.dark_slate_gray}`,
    display: 'flex',
    alignItems: 'flexStart'
  },
  button: {
    margin: 20,
    fontSize: 20
  }
};
