import React from 'react';
import {
  getManifest,
  generateLevelAnimationsManifest
} from '@cdo/apps/assetManagement/animationLibraryApi';
import AnimationPickerBody from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody.jsx';
import {createUuid} from '@cdo/apps/utils';
import color from '@cdo/apps/util/color';
import PropTypes from 'prop-types';
import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';

const THUMBNAIL_SIZE = 50;
const THUMBNAIL_BORDER_WIDTH = 1;

export default class SelectStartAnimations extends React.Component {
  static propTypes = {
    useAllSprites: PropTypes.bool
  };

  state = {
    levelAnimationsManifest: {},
    libraryManifest: {},
    orderedKeys: [],
    propsByKey: {}
  };

  componentDidMount() {
    getManifest('spritelab')
      .then(sprites => {
        this.setState({libraryManifest: sprites});
      })
      .catch(err => {
        console.log(err);
      });

    if (this.props.useAllSprites) {
      generateLevelAnimationsManifest()
        .then(manifest => {
          this.setState({levelAnimationsManifest: JSON.parse(manifest)});
        })
        .catch(err => {
          console.log(err);
        });
    }
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
    const {orderedKeys, propsByKey} = this.state;
    return (
      <div>
        <h2>Select Starting Animations</h2>
        <div style={styles.pageBreak}>
          <h3>Selected Animations:</h3>
          {this.displaySelectedSprites()}
        </div>
        {this.props.useAllSprites && (
          <div style={styles.pageBreak}>
            <h3>
              Hidden Animations (Animations that don't normally appear in the
              animation library):
            </h3>
            <AnimationPickerBody
              is13Plus={true}
              onDrawYourOwnClick={() =>
                console.log('Not supported at this time')
              }
              onPickLibraryAnimation={this.addAnimationToList}
              onAnimationSelectionComplete={() => {}}
              onUploadClick={() => console.log('Not supported at this time')}
              playAnimations={false}
              libraryManifest={this.state.levelAnimationsManifest}
              hideUploadOption={false}
              hideAnimationNames={false}
              navigable={true}
              hideBackgrounds={false}
              canDraw={false}
              pickerType={PICKER_TYPE.spritelab}
              selectedAnimations={[]}
            />
          </div>
        )}
        <div style={styles.pageBreak}>
          <h3>Library Animations:</h3>
          <AnimationPickerBody
            is13Plus={true}
            onDrawYourOwnClick={() => console.log('Not supported at this time')}
            onPickLibraryAnimation={this.addAnimationToList}
            onAnimationSelectionComplete={() => {}}
            onUploadClick={() => console.log('Not supported at this time')}
            playAnimations={false}
            libraryManifest={this.state.libraryManifest}
            hideUploadOption={false}
            hideAnimationNames={false}
            navigable={true}
            hideBackgrounds={false}
            canDraw={false}
            pickerType={PICKER_TYPE.spritelab}
            selectedAnimations={[]}
          />
        </div>
        <p>{JSON.stringify({orderedKeys, propsByKey})}</p>
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
  },
  pageBreak: {
    borderTop: '1px solid gray'
  }
};
