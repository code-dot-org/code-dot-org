import React from 'react';
import {
  getDefaultList,
  updateDefaultList
} from '@cdo/apps/assetManagement/animationLibraryApi';
import DefaultSpriteRow from '@cdo/apps/code-studio/assets/DefaultSpriteRow';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

export default class DefaultSpritesEditor extends React.Component {
  state = {
    isLoading: true,
    defaultList: {}
  };

  componentDidMount() {
    getDefaultList()
      .then(spriteDefault => {
        var spriteList = {};
        spriteDefault['default_sprites'].map(
          sprite => (spriteList[sprite.name] = sprite)
        );
        this.setState({defaultList: spriteList});
        this.setState({isLoading: false});
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteSpriteFromDefaults(spriteName) {
    delete this.state.defaultList[spriteName];
  }

  updateDefaultSprites() {
    let jsonList = {};
    jsonList['default_sprites'] = Object.values(this.state.defaultList);
    updateDefaultList(JSON.stringify(jsonList)).catch(err => {
      console.log(err);
    });
  }

  renderDefaultSprites() {
    return Object.keys(this.state.defaultList).map(spriteKey => {
      let spriteObject = this.state.defaultList[spriteKey];
      return (
        <DefaultSpriteRow
          name={spriteObject.name}
          keyValue={spriteObject.key}
          onDelete={this.deleteSpriteFromDefaults.bind(this)}
          key={spriteObject.name}
        />
      );
    });
  }

  // Button rendered twice - at top and bottom of list - to minimize
  // required scrolling
  renderUploadButton() {
    return (
      <button type="button" onClick={this.updateDefaultSprites.bind(this)}>
        Update Default Sprites List
      </button>
    );
  }

  render() {
    let isLoading = this.state.isLoading;

    return (
      <div>
        <a href="/sprites">Back to Sprite Management</a>
        <h1>Edit Default Sprites</h1>
        <h2>
          Remove or add sprites from the default dropdown list in Sprite Lab.
        </h2>
        <p>
          Sprites are shown in the format: "name: category/path". The order of
          this list is the order that the sprites appear in the dropdown.
          Changes aren't saved until the "Update Default Sprites List" button is
          clicked.
        </p>
        {this.renderUploadButton()}
        {isLoading && (
          <div>
            <Spinner />
          </div>
        )}
        {this.renderDefaultSprites()}
        {this.renderUploadButton()}
      </div>
    );
  }
}
