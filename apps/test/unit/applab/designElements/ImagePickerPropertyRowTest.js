import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {DATA_URL_NOT_ALLOWED_MESSAGE} from '@cdo/apps/applab/constants';
import ImagePickerPropertyRow from '@cdo/apps/applab/designElements/ImagePickerPropertyRow';

describe('ImagePickerPropertyRow', () => {
  it('blocks manual data URLs and shows an error', async () => {
    const handleChange = jest.fn();
    const wrapper = shallow(
      <ImagePickerPropertyRow
        desc="Image"
        initialValue=""
        handleChange={handleChange}
      />
    );

    await wrapper
      .instance()
      .changeImageInternal('  DATA:image/png;base64,AAA=');
    wrapper.update();

    expect(handleChange).not.toHaveBeenCalled();
    expect(wrapper.state('errorMessage')).toBe(DATA_URL_NOT_ALLOWED_MESSAGE);
  });
});
