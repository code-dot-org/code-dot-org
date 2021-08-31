import React from 'react';
import {
  getManifest,
  getLevelAnimationsFiles
} from '@cdo/apps/assetManagement/animationLibraryApi';
import AnimationPickerBody from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody.jsx';
import {createUuid} from '@cdo/apps/utils';
import color from '@cdo/apps/util/color';

const THUMBNAIL_SIZE = 50;
const THUMBNAIL_BORDER_WIDTH = 1;

export default class SelectStartAnimations extends React.Component {
  state = {
    levelAnimations: [],
    libraryManifest: {},
    orderedKeys: [],
    propsByKey: {}
  };

  componentDidMount() {
    getManifest('spritelab')
      .then(sprites => {
        this.setState({libraryManifest: sprites});
      })
      .then(() => {
        getLevelAnimationsFiles().then(sprites => {
          let onlyPngs = sprites.files.filter(filename => {
            let lowercase = filename.toLowerCase();
            return lowercase.endsWith('png');
          });
          this.setState({levelAnimations: onlyPngs});
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  addAnimationToList = animation => {
    const key = createUuid();

    let updatedOrderedKeys = [key].concat(this.state.orderedKeys);
    this.setState({orderedKeys: updatedOrderedKeys});

    let propsByKey = {...this.state.propsByKey};
    propsByKey[key] = animation;
    this.setState({propsByKey: propsByKey});
  };

  removeAnimationFromList = key => {
    let updatedOrderedKeys = [...this.state.orderedKeys];
    let indexToRemove = updatedOrderedKeys.indexOf(key);
    updatedOrderedKeys.splice(indexToRemove, 1);
    this.setState({orderedKeys: updatedOrderedKeys});

    let propsByKey = {...this.state.propsByKey};
    delete propsByKey[key];
    this.setState({propsByKey: propsByKey});
  };

  displaySelectedSprites = () => {
    const {propsByKey, orderedKeys} = this.state;
    return orderedKeys.map(key => {
      return (
        <img
          key={key}
          src={propsByKey[key].sourceUrl}
          alt={propsByKey[key].name}
          style={styles.thumbnail}
          role="button"
          onClick={() => this.removeAnimationFromList(key)}
        />
      );
    });
  };

  render() {
    let {orderedKeys, propsByKey} = this.state;
    let animationObject = {orderedKeys, propsByKey};
    return (
      <div>
        <h2>Select Starting Animations</h2>
        <div>
          <h3>Selected Animations:</h3>
          {this.displaySelectedSprites()}
        </div>
        <div>
          <AnimationPickerBody
            is13Plus={true}
            onDrawYourOwnClick={() => console.log('Not supported at this time')}
            onPickLibraryAnimation={this.addAnimationToList}
            onUploadClick={() => console.log('Not supported at this time')}
            playAnimations={false}
            libraryManifest={this.state.libraryManifest}
            hideUploadOption={false}
            hideAnimationNames={false}
            navigable={true}
            hideBackgrounds={false}
            canDraw={false}
          />
        </div>
        <p>{JSON.stringify(animationObject)}</p>
      </div>
    );
  }
}

const styles = {
  thumbnail: {
    height: THUMBNAIL_SIZE,
    borderStyle: 'solid',
    borderColor: color.light_gray,
    borderWidth: THUMBNAIL_BORDER_WIDTH,
    borderRadius: 12,
    cursor: 'pointer',
    ':hover': {
      borderColor: color.purple
    }
  }
};
