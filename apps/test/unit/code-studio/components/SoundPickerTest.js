import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SoundPicker from '@cdo/apps/code-studio/components/SoundPicker';

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
    expect(wrapper.find('#modeSwitch').length).toEqual(0);
  });
  it('shows the mode switch tabs when libraryOnly is false', () => {
    const props = {...defaultProps, libraryOnly: false};
    const wrapper = mount(<SoundPicker {...props} />);
    expect(wrapper.find('#modeSwitch').length).toEqual(1);
  });
});
