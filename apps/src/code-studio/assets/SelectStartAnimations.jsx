import React from 'react';
import {
  getManifest,
  generateLevelAnimationsManifest,
} from '@cdo/apps/assetManagement/animationLibraryApi';
import AnimationPickerBody from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody.jsx';
import {createUuid} from '@cdo/apps/utils';
import color from '@cdo/apps/util/color';
import PropTypes from 'prop-types';
import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';

const THUMBNAIL_SIZE = 50;
const THUMBNAIL_BORDER_WIDTH = 1;
const noop = () => undefined;

/*
  Renders one or two animation selectors for content writers to choose sprites and generate
  an animation JSON. Only offers SpriteLab animations.
 */
export default class SelectStartAnimations extends React.Component {
  static propTypes = {
    useAllSprites: PropTypes.bool,
  };

  state = {
    levelAnimationsManifest: {},
    libraryManifest: {},
    orderedKeys: [],
    propsByKey: {},
  };

  componentDidMount() {
    getManifest('spritelab')
      .then(sprites => {
        this.setState({libraryManifest: sprites});
      })
      .catch(err => {
        console.error(err);
      });

    if (this.props.useAllSprites) {
      generateLevelAnimationsManifest()
        .then(manifest => {
          this.setState({levelAnimationsManifest: JSON.parse(manifest)});
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  addAnimationToList = animation => {
    const key = createUuid();

    this.setState({orderedKeys: [...this.state.orderedKeys, key]});

    let propsByKey = {...this.state.propsByKey};
    propsByKey[key] = animation;
    this.setState({propsByKey});
  };

  removeAnimationFromList = key => {
    let updatedOrderedKeys = [...this.state.orderedKeys];
    let indexToRemove = updatedOrderedKeys.indexOf(key);
    updatedOrderedKeys.splice(indexToRemove, 1);
    this.setState({orderedKeys: updatedOrderedKeys});

    let propsByKey = {...this.state.propsByKey};
    delete propsByKey[key];
    this.setState({propsByKey});
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

  displayAnimationPickerBody = libraryManifest => {
    return (
      <AnimationPickerBody
        onDrawYourOwnClick={noop}
        onPickLibraryAnimation={this.addAnimationToList}
        onAnimationSelectionComplete={noop}
        onUploadClick={noop}
        playAnimations={false}
        libraryManifest={libraryManifest}
        hideAnimationNames={false}
        navigable
        hideBackgrounds={false}
        pickerType={PICKER_TYPE.animationJson}
        selectedAnimations={[]}
        hideCostumes={false}
        shouldWarnOnAnimationUpload={false}
      />
    );
  };

  render() {
    const {orderedKeys, propsByKey} = this.state;
    return (
      <React.Fragment>
        <a href="/sprites">Back to Asset Management</a>
        <h2>Generate Animation JSON for a level</h2>
        <p>
          This tool generates Animation JSON for costumes and backgrounds in
          Sprite Lab levels (including CS Connections subtypes such as Story and
          Science levels) and Poetry levels. Costumes and backgrounds, once
          selected, will show up in the same order that students will view them
          from their dropdown menu.
        </p>
        <p>
          Level-specific animations contain images uploaded specifically for
          certain levels. They are not available to students in the animations
          library.
        </p>
        <div style={styles.pageBreak}>
          <h3>Selected Animations:</h3>
          {this.displaySelectedSprites()}
        </div>
        {this.props.useAllSprites && (
          <div style={styles.pageBreak}>
            <h3>
              Level-specific Animations (Animations that do not appear in the
              animation library):
            </h3>
            {this.displayAnimationPickerBody(
              this.state.levelAnimationsManifest
            )}
          </div>
        )}
        <div style={styles.pageBreak}>
          <h3>Library Animations:</h3>
          {this.displayAnimationPickerBody(this.state.libraryManifest)}
        </div>
        <h2>Generated Animation JSON:</h2>
        <p>{JSON.stringify({orderedKeys, propsByKey})}</p>
      </React.Fragment>
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
  },
  pageBreak: {
    borderTop: '1px solid gray',
  },
};
