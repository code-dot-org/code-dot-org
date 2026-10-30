import PhotoPrompterButton from '@codebridge/MiniAppPreview/PhotoPrompterButton';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

// MUI's button ripple schedules state updates across a timer, a microtask, and
// an effect, which don't line up with act() boundaries and warn after the test.
// The ripple is cosmetic, so disable it; it has no bearing on what we assert.
const noRippleTheme = createTheme({
  components: {MuiButtonBase: {defaultProps: {disableRipple: true}}},
});

const renderButton = (
  props: React.ComponentProps<typeof PhotoPrompterButton>
) =>
  render(
    <ThemeProvider theme={noRippleTheme}>
      <PhotoPrompterButton {...props} />
    </ThemeProvider>
  );

describe('PhotoPrompterButton', () => {
  it('renders the prompt text as the button label', () => {
    renderButton({
      promptText: 'Take a photo of a tree',
      onPhotoSelected: () => {},
    });

    expect(
      screen.getByRole('button', {name: 'Take a photo of a tree'})
    ).toBeInTheDocument();
  });

  it('focuses the button when it appears', () => {
    renderButton({promptText: 'Take a photo', onPhotoSelected: () => {}});

    expect(screen.getByRole('button', {name: 'Take a photo'})).toHaveFocus();
  });

  it('opens the file picker when the button is clicked', async () => {
    const clickInput = jest.spyOn(HTMLInputElement.prototype, 'click');
    renderButton({promptText: 'Take a photo', onPhotoSelected: () => {}});

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', {name: 'Take a photo'}));

    expect(clickInput).toHaveBeenCalledTimes(1);
    clickInput.mockRestore();
  });

  it('calls onPhotoSelected with the chosen file', async () => {
    // The input is hidden and unlabeled by design, so it has no accessible
    // handle. The button is the only entry point a user has: clicking it opens
    // the OS picker, and the spy's recorded `this` is the input the picker
    // returns its file to. Firing the change on it stands in for that selection.
    const clickInput = jest.spyOn(HTMLInputElement.prototype, 'click');
    const onPhotoSelected = jest.fn();
    renderButton({promptText: 'Take a photo', onPhotoSelected});

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', {name: 'Take a photo'}));

    const input = clickInput.mock.instances[0] as unknown as HTMLInputElement;
    const file = new File(['photo'], 'photo.png', {type: 'image/png'});
    fireEvent.change(input, {target: {files: [file]}});

    expect(onPhotoSelected).toHaveBeenCalledTimes(1);
    expect(onPhotoSelected).toHaveBeenCalledWith(file);
    clickInput.mockRestore();
  });
});
