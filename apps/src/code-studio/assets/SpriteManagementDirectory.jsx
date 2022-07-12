import React, {useState} from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {moveDefaultSpriteMetadataToProduction} from '@cdo/apps/assetManagement/animationLibraryApi';
import StatusCheckmarkIcon, {
  iconStatus
} from '@cdo/apps/code-studio/components/StatusCheckmarkIcon';

export default function SpriteManagementDirectory() {
  const [moveChangesStatus, setMoveChangesStatus] = useState(
    iconStatus.noAction
  );

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
        <h3>
          <a href="/sprites/select_start_animations?library=all">
            Select Start Animations From All Sprites
          </a>
        </h3>
        <h5>This takes a while to load, use the other link when possible</h5>
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
