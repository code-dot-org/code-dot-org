import React from 'react';
import {
  getManifest,
  getLevelAnimationsFiles
} from '@cdo/apps/assetManagement/animationLibraryApi';
import Button from '@cdo/apps/templates/Button';
import AnimationPickerBody from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody.jsx';
import {createUuid} from '@cdo/apps/utils';

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

  render() {
    return (
      <div>
        <h2>Select Starting Animations</h2>
        <Button
          text="Generate animation JSON"
          color={Button.ButtonColor.red}
          onClick={() => console.log('Test')}
        />
        <div style={styles.categoryRows}>
          <div>
            <h3>Selected Animations:</h3>
            {this.displaySelectedSprites()}
          </div>
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
      </div>
    );
  }
}

const styles = {
  categoryRows: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  addButtons: {
    display: 'flex',
    justifyContent: 'flex-start'
  }
};
