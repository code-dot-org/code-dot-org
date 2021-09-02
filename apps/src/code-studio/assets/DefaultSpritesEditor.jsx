import React from 'react';
import {
  getDefaultList,
  updateDefaultList,
  regenerateDefaultJSON
} from '@cdo/apps/assetManagement/animationLibraryApi';
import DefaultSpriteRow from '@cdo/apps/code-studio/assets/DefaultSpriteRow';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import AddDefaultSprite from '@cdo/apps/code-studio/assets/AddDefaultSprite';
import Button from '@cdo/apps/templates/Button';

export default class DefaultSpritesEditor extends React.Component {
  state = {
    isLoading: true,
    defaultList: [], // Array of name/category sprite objects
    pendingChangesCount: 0,
    isUpdating: false,
    errorText: ''
  };

  componentDidMount() {
    getDefaultList()
      .then(spriteDefault => {
        let orderedList = Array.from(spriteDefault['default_sprites']);
        this.setState({defaultList: orderedList, isLoading: false});
      })
      .catch(err => {
        console.log(err);
      });
  }

  incrementPendingChanges = () => {
    this.setState(state => ({
      pendingChangesCount: state.pendingChangesCount + 1
    }));
  };

  deleteSpriteFromDefaults = spriteName => {
    let updatedList = [...this.state.defaultList];
    // Find the index at which the sprite should be deleted
    for (let index = 0; index < updatedList.length; index++) {
      let sprite = updatedList[index];
      if (sprite.name === spriteName) {
        // Item is to be deleted
        updatedList.splice(index, 1);
      }
    }
    this.setState({defaultList: updatedList});
    this.incrementPendingChanges();
  };

  addSpriteToDefaults = (addToBeginning, spriteName, spriteCategory) => {
    let updatedList = [...this.state.defaultList];
    if (addToBeginning) {
      updatedList.unshift({name: spriteName, key: spriteCategory});
    } else {
      updatedList.push({name: spriteName, key: spriteCategory});
    }
    this.setState({defaultList: updatedList});
    this.incrementPendingChanges();
  };

  reorderSpriteByOne = (moveForward, spriteName) => {
    let updatedList = [...this.state.defaultList];
    let originalIndex = -1;
    // Find index
    for (let index = 0; index < updatedList.length; index++) {
      if (updatedList[index].name === spriteName) {
        originalIndex = index;
      }
    }

    // If the original index is less than 0, take no action
    if (originalIndex < 0) {
      return;
    }

    let itemToMove = updatedList.splice(originalIndex, 1)[0];

    if (moveForward) {
      // No action to move the first element forward
      if (originalIndex > 0) {
        updatedList.splice(originalIndex - 1, 0, itemToMove);
      }
    } else {
      // No action to move the last element back
      if (originalIndex < updatedList.length) {
        updatedList.splice(originalIndex + 1, 0, itemToMove);
      }
    }

    this.setState({defaultList: updatedList});
    this.incrementPendingChanges();
  };

  updateDefaultSprites = () => {
    this.setState({isUpdating: true});
    let jsonList = {};
    jsonList['default_sprites'] = this.state.defaultList;
    updateDefaultList(jsonList)
      .then(() => regenerateDefaultJSON(jsonList))
      .then(() => {
        this.setState({
          pendingChangesCount: 0,
          isUpdating: false,
          errorText: ''
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({errorText: err.toString(), isUpdating: false});
      });
  };

  renderDefaultSprites() {
    return this.state.defaultList.map(spriteObject => {
      return (
        <DefaultSpriteRow
          name={spriteObject.name}
          keyValue={spriteObject.key}
          onDelete={this.deleteSpriteFromDefaults}
          onMove={this.reorderSpriteByOne}
          key={spriteObject.name}
        />
      );
    });
  }

  // Button rendered twice - at top and bottom of list - to minimize
  // required scrolling
  renderUploadButton() {
    let {isUpdating, errorText} = this.state;
    return (
      <div>
        <div style={styles.changesRow}>
          <Button
            onClick={this.updateDefaultSprites}
            color={Button.ButtonColor.blue}
            text="Update Default Sprites List"
          />
          <p>Pending Changes: {this.state.pendingChangesCount}</p>
          {isUpdating && <Spinner />}
        </div>
        {errorText.length > 0 && <p>{errorText}. Please try again.</p>}
      </div>
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
        <AddDefaultSprite onAdd={this.addSpriteToDefaults} />
        {isLoading && <Spinner />}
        {this.renderDefaultSprites()}
        {this.renderUploadButton()}
      </div>
    );
  }
}

const styles = {
  changesRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};
