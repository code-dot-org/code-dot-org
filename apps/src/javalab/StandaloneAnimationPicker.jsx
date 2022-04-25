import React, {useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import AnimationPickerBody from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody.jsx';
import LoadableComponent from '@cdo/apps/templates/LoadableComponent';
import {getManifest} from '@cdo/apps/assetManagement/animationLibraryApi';
import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';

export default function StandaloneAnimationPicker({
  manifest,
  onAnimationsSelected
}) {
  return (
    <LoadableComponent
      loadFunction={(manifest, onLoadSuccess, onLoadError) => {
        getManifest(manifest)
          .then(sprites => {
            onLoadSuccess([sprites]);
          })
          .catch(err => {
            onLoadError(err);
          });
      }}
      loadArgs={[manifest]}
      renderFunction={sprites => (
        <MultiSelectAnimationPicker
          sprites={sprites}
          onAnimationsSelected={onAnimationsSelected}
        />
      )}
    />
  );
}

StandaloneAnimationPicker.propTypes = {
  manifest: PropTypes.object,
  onAnimationsSelected: PropTypes.func
};

function MultiSelectAnimationPicker({sprites, onAnimationsSelected}) {
  const [selectedAnimations, setSelectedAnimations] = useState([]);
  const onPickLibraryAnimation = animation => {
    const index = selectedAnimations.indexOf(animation);
    const updated = _.cloneDeep(selectedAnimations);
    if (index > -1) {
      updated.splice(index, 1);
    } else {
      updated.push(animation);
    }
    setSelectedAnimations(updated);
  };

  return (
    <AnimationPickerBody
      is13Plus
      onDrawYourOwnClick={() => console.log('Not supported at this time')}
      onPickLibraryAnimation={onPickLibraryAnimation}
      onAnimationSelectionComplete={() => {
        onAnimationsSelected(selectedAnimations);
      }}
      onUploadClick={() => console.log('Not supported at this time')}
      playAnimations={false}
      libraryManifest={sprites}
      hideUploadOption
      hideAnimationNames={false}
      navigable
      hideBackgrounds={false}
      canDraw={false}
      pickerType={PICKER_TYPE.spritelab}
      selectedAnimations={selectedAnimations}
    />
  );
}

MultiSelectAnimationPicker.propTypes = {
  sprites: PropTypes.array,
  onAnimationsSelected: PropTypes.func
};
