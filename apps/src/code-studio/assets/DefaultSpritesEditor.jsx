import React from 'react';

import {
  getDefaultListMetadata,
  regenerateDefaultSpriteMetadata,
} from '@cdo/apps/assetManagement/animationLibraryApi';
import DefaultSpriteRow from '@cdo/apps/code-studio/assets/DefaultSpriteRow';
import Button from '@cdo/apps/legacySharedComponents/Button';
import Spinner from '@cdo/apps/sharedComponents/spinner';

export default class DefaultSpritesEditor extends React.Component {
  state = {
    isLoading: true,
    defaultList: [], // Array of name/category sprite objects
    pendingChangesCount: 0,
    isUpdating: false,
    errorText: '',
  };

  componentDidMount() {
    getDefaultListMetadata('levelbuilder')
      .then(spriteDefault => {
        let orderedList = Object.values(spriteDefault.propsByKey);
        this.setState({defaultList: orderedList, isLoading: false});
      })
      .catch(err => {
        console.log(err);
      });
  }

  incrementPendingChanges = () => {
    this.setState(state => ({
      pendingChangesCount: state.pendingChangesCount + 1,
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
    regenerateDefaultSpriteMetadata(this.state.defaultList)
      .then(() => {
        this.setState({
          pendingChangesCount: 0,
          isUpdating: false,
          errorText: '',
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
            text="Update Default List"
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
        <a href="/sprites">Back to Asset Management</a>
        <h1>Edit Default Sprite Costumes and Backgrounds</h1>
        <p>
          These animations are preloaded in any new project or any level with
          the option set to "Use default sprites as starting animation JSON"
        </p>
        <h2>Add or remove default sprite costumes and backgrounds.</h2>
        <p>
          The order of this list is the order that the costumes and backgrounds
          appear in a new project.{' '}
          <i>
            Note: In Sprite Lab, Sprite costumes and backgrounds are always
            listed separately.
          </i>
        </p>
        <p>
          Changes aren't saved until the "Update Default List" button is
          clicked.
        </p>
        {this.renderUploadButton()}
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
    alignItems: 'center',
  },
};
