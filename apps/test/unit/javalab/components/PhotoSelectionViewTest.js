import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import PhotoSelectionView from '@cdo/apps/javalab/components/PhotoSelectionView';

import {expect} from '../../../util/reconfiguredChai';

describe('PhotoSelectionView', () => {
  const file = new File([], 'file');
  let onPhotoSelected, promptText;

  beforeEach(() => {
    onPhotoSelected = sinon.stub();
    promptText = 'prompt';
  });

  it('displays photo selection view with prompt if provided', () => {
    const wrapper = shallow(
      <PhotoSelectionView
        onPhotoSelected={onPhotoSelected}
        promptText={promptText}
      />
    );

    expect(wrapper.text()).to.equal(promptText);
  });

  it('invokes onPhotoSelected callback after photo is selected', () => {
    const wrapper = shallow(
      <PhotoSelectionView onPhotoSelected={onPhotoSelected} />
    );

    wrapper.find('input').invoke('onChange')({target: {files: [file]}});

    sinon.assert.calledWith(onPhotoSelected, file);
  });
});
