import React from 'react';
import {
  getDefaultListMetadata,
  getManifest,
  regenerateDefaultSpriteMetadata
} from '@cdo/apps/assetManagement/animationLibraryApi';
import DefaultSpriteRow from '@cdo/apps/code-studio/assets/DefaultSpriteRow';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import Button from '@cdo/apps/templates/Button';
import AnimationPickerBody from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody.jsx';
import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

export default class DefaultSpritesEditor extends React.Component {
  state = {
    isLoading: true,
    defaultList: [], // Array of name/category sprite objects
    pendingChangesCount: 0,
    isUpdating: false,
    errorText: '',
    displayAnimationPicker: false,
    libraryManifest: {}
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

    getManifest('spritelab')
      .then(sprites => {
        this.setState({libraryManifest: sprites});
      })
      .catch(err => {
        console.error(err);
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
          errorText: ''
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({errorText: err.toString(), isUpdating: false});
      });
  };

  // Add the selected sprite to the end of the list of default sprites
  handleSpriteAdd = targetSprite => {
    let updatedList = this.state.defaultList;
    let defaultSprite = {
      categories: targetSprite.categories,
      frameCount: targetSprite.frameCount,
      frameDelay: targetSprite.frameDelay,
      frameSize: targetSprite.frameSize,
      looping: targetSprite.looping,
      name: targetSprite.name,
      sourceUrl: targetSprite.sourceUrl,
      version: targetSprite.version
    };
    updatedList.push(defaultSprite);

    this.setState({displayAnimationPicker: false, defaultList: updatedList});
    this.incrementPendingChanges();
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

  // Buttons rendered twice - at top and bottom of list - to minimize
  // required scrolling
  renderButtonRow() {
    let {isUpdating, errorText} = this.state;
    return (
      <div>
        <div style={styles.changesRow}>
          <Button
            onClick={() => this.setState({displayAnimationPicker: true})}
            color={Button.ButtonColor.blue}
            text="Add a Sprite to the Default List"
          />
          <BaseDialog
            isOpen={this.state.displayAnimationPicker}
            handleClose={() => this.setState({displayAnimationPicker: false})}
            fullWidth
          >
            <AnimationPickerBody
              is13Plus
              onDrawYourOwnClick={() =>
                console.log('Not supported at this time')
              }
              onPickLibraryAnimation={target => this.handleSpriteAdd(target)}
              onAnimationSelectionComplete={() => {}}
              onUploadClick={() => console.log('Not supported at this time')}
              playAnimations={false}
              libraryManifest={this.state.libraryManifest}
              hideUploadOption
              hideAnimationNames={false}
              navigable
              hideBackgrounds={false}
              canDraw={false}
              pickerType={PICKER_TYPE.spritelab}
              selectedAnimations={[]}
            />
          </BaseDialog>
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

        {this.renderButtonRow()}
        {isLoading && <Spinner />}
        {this.renderDefaultSprites()}
        {this.renderButtonRow()}
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
