import React from 'react';
import {getDefault} from '@cdo/apps/assetManagement/animationLibraryApi';
import DefaultSpriteRow from '@cdo/apps/code-studio/assets/DefaultSpriteRow';

export default class DefaultSpritesEditor extends React.Component {
  state = {
    defaultList: []
  };

  componentDidMount() {
    getDefault().then(spriteDefault => {
      var spriteList = [];
      spriteDefault['default_sprites'].map(sprite => spriteList.push(sprite));
      this.setState({defaultList: spriteList});
    });
  }

  renderDefaultSprites() {
    return this.state.defaultList.map(sprite => {
      return (
        <DefaultSpriteRow name={sprite['name']} keyValue={sprite['key']} />
      );
    });
  }

  render() {
    return (
      <div>
        <a href="/sprites">Back to Sprite Management</a>
        <h1>Edit Default Sprites</h1>
        <h2>
          Edit the list to add or remove sprites from the default dropdown list
          in Sprite Lab
        </h2>
        <div>{this.renderDefaultSprites()}</div>
        <button type="button" onClick={() => console.log('Update defaults')}>
          Update Default Sprites List
        </button>
      </div>
    );
  }
}
