import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SoundPicker from '@cdo/apps/code-studio/components/SoundPicker';

import {assert} from '../../../util/reconfiguredChai';

describe('SoundPicker', () => {
  const defaultProps = {
    assetChosen: () => true,
    uploadsEnabled: false,
    showUnderageWarning: false,
    useFilesApi: false,
  };
  it('does not show mode switch tabs when libraryOnly is true', () => {
    const props = {...defaultProps, libraryOnly: true};
    const wrapper = mount(<SoundPicker {...props} />);
    assert.equal(wrapper.find('#modeSwitch').length, 0);
  });
  it('shows the mode switch tabs when libraryOnly is false', () => {
    const props = {...defaultProps, libraryOnly: false};
    const wrapper = mount(<SoundPicker {...props} />);
    assert.equal(wrapper.find('#modeSwitch').length, 1);
  });
});
