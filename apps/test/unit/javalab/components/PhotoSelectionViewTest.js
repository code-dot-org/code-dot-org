import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PhotoSelectionView from '@cdo/apps/javalab/components/PhotoSelectionView';

describe('PhotoSelectionView', () => {
  const file = new File([], 'file');
  let onPhotoSelected, promptText;

  beforeEach(() => {
    onPhotoSelected = jest.fn();
    promptText = 'prompt';
  });

  it('displays photo selection view with prompt if provided', () => {
    const wrapper = shallow(
      <PhotoSelectionView
        onPhotoSelected={onPhotoSelected}
        promptText={promptText}
      />
    );

    expect(wrapper.text()).toBe(promptText);
  });

  it('invokes onPhotoSelected callback after photo is selected', () => {
    const wrapper = shallow(
      <PhotoSelectionView onPhotoSelected={onPhotoSelected} />
    );

    wrapper.find('input').invoke('onChange')({target: {files: [file]}});

    expect(onPhotoSelected).toHaveBeenCalledWith(file);
  });
});
