import PhotoPrompterButton from '@codebridge/MiniAppPreview/PhotoPrompterButton';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

describe('PhotoPrompterButton', () => {
  it('renders the prompt text as the button label', () => {
    render(
      <PhotoPrompterButton
        promptText="Take a photo of a tree"
        onPhotoSelected={() => {}}
      />
    );

    expect(
      screen.getByRole('button', {name: 'Take a photo of a tree'})
    ).toBeInTheDocument();
  });

  it('focuses the button when it appears', () => {
    render(
      <PhotoPrompterButton
        promptText="Take a photo"
        onPhotoSelected={() => {}}
      />
    );

    expect(screen.getByRole('button', {name: 'Take a photo'})).toHaveFocus();
  });

  it('calls onPhotoSelected with the chosen file', async () => {
    const onPhotoSelected = jest.fn();
    render(
      <PhotoPrompterButton
        promptText="Take a photo"
        onPhotoSelected={onPhotoSelected}
      />
    );

    const file = new File(['photo'], 'photo.png', {type: 'image/png'});
    const input = screen.getByLabelText('Take a photo', {selector: 'input'});
    await userEvent.upload(input, file);

    expect(onPhotoSelected).toHaveBeenCalledTimes(1);
    expect(onPhotoSelected).toHaveBeenCalledWith(file);
  });
});
