import React from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import {
  getDefaultListMetadata,
  moveDefaultSpriteMetadataToProduction
} from '@cdo/apps/assetManagement/animationLibraryApi';
import DefaultSpriteRow from '@cdo/apps/code-studio/assets/DefaultSpriteRow';

export default class ReleaseDefaultSprites extends React.Component {
  state = {
    defaultList: [] // Array of name/category sprite objects
  };

  componentDidMount() {
    getDefaultListMetadata('levelbuilder')
      .then(spriteDefault => {
        let orderedList = Array.from(spriteDefault['default_sprites']);
        this.setState({defaultList: orderedList});
      })
      .catch(err => {
        console.log(err);
      });
  }

  confirmReleaseChangesToLevelbuilder = () => {
    let shouldRelease = confirm(
      'This will release any changes to the default sprite list to ' +
        'production. Are you sure?'
    );
    if (shouldRelease) {
      this.moveChangesToProduction();
    }
  };

  moveChangesToProduction = () => {
    //Files to move to production folder: defaultSprites.json
    moveDefaultSpriteMetadataToProduction().catch(err => {
      console.log(err);
    });
  };

  render() {
    return (
      <div>
        <a href="/sprites">Back to Asset Management</a>
        <h1>Release Default Sprites from Levelbuilder to Production</h1>
        <p>
          If you made changes to the list of default sprites on this
          <a href="/sprites/default_sprites_editor">tool</a>, those changes are
          saved only to the levelbuilder environment. By pressing this button,
          those changes will be sent to production and become available to
          students immediately.
        </p>

        <div style={styles.pageBreak}>
          <Button
            text="Release Changes to Production"
            color={Button.ButtonColor.red}
            onClick={this.confirmReleaseChangesToLevelbuilder}
            style={styles.button}
          />
        </div>

        <div style={styles.pageBreak}>
          <div>
            {this.state.defaultList.map(spriteObject => {
              return (
                <DefaultSpriteRow
                  name={spriteObject.name}
                  keyValue={spriteObject.key}
                  onDelete={this.deleteSpriteFromDefaults}
                  onMove={this.reorderSpriteByOne}
                  key={spriteObject.name}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
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
