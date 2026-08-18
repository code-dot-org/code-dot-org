import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {DATA_URL_NOT_ALLOWED_MESSAGE} from '@cdo/apps/applab/constants';
import ImagePickerPropertyRow from '@cdo/apps/applab/designElements/ImagePickerPropertyRow';

describe('ImagePickerPropertyRow', () => {
  it('blocks manual data URLs and shows an error', () => {
    const handleChange = jest.fn();
    render(
      <ImagePickerPropertyRow
        desc="Image"
        initialValue=""
        handleChange={handleChange}
      />
    );

    fireEvent.change(screen.getByRole('textbox', {name: 'Image'}), {
      target: {value: '  DATA:image/png;base64,AAA='},
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      DATA_URL_NOT_ALLOWED_MESSAGE
    );
    expect(handleChange).not.toHaveBeenCalled();
  });
});
