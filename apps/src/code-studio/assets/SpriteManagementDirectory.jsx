import React from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {moveDefaultSpriteMetadataToProduction} from '@cdo/apps/assetManagement/animationLibraryApi';

export default class SpriteManagementDirectory extends React.Component {
  state = {
    updated: false
  };

  moveChangesToProduction = () => {
    //Files to move to production folder: defaultSprites.json
    moveDefaultSpriteMetadataToProduction()
      .then(() => {
        this.setState({updated: true});
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const {updated} = this.state;
    return (
      <div>
        <h1>Manage Sprite Lab Sprites</h1>
        <h3>
          <a href="/sprites/sprite_upload">Upload New Sprites</a>
        </h3>
        <h3>
          <a href="/sprites/default_sprites_editor">Edit Default Sprites</a>
        </h3>
        <div style={styles.pageBreak}>
          <Button
            text="Release Changes to Production"
            color={Button.ButtonColor.red}
            onClick={() => {
              let shouldRelease = confirm(
                'This will release all the sprites you have added and updates to the default sprite list to ' +
                  'production. Are you sure?'
              );
              if (shouldRelease) {
                this.moveChangesToProduction();
              }
            }}
            style={styles.button}
          />
          <i
            style={{
              ...styles.checkmark,
              visibility: updated ? 'visible' : 'hidden'
            }}
            className="fa fa-check"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }
}

const styles = {
  pageBreak: {
    borderTop: `1px solid ${color.dark_slate_gray}`
  },
  button: {
    margin: 20,
    fontSize: '20px'
  },
  checkmark: {
    color: color.light_green,
    fontSize: 18,
    left: 5,
    lineHeight: '25px',
    position: 'relative',
    top: 7
  }
};
