import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {ImportProjectDialog} from '@cdo/apps/applab/ImportProjectDialog';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

const ERROR_MESSAGE =
  "We can't seem to find this project. " +
  "Please make sure you've entered a valid App Lab project URL.";

describe('Applab ImportProjectDialog component', function () {
  const defaultProps = {
    isOpen: true,
    onImport: () => {},
    handleClose: () => {},
  };

  function renderDialog(props) {
    render(<ImportProjectDialog {...defaultProps} {...props} />);
  }

  it('renders nothing when the dialog is closed', () => {
    renderDialog({isOpen: false});
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('renders a text input and next button', () => {
    renderDialog();
    expect(screen.getByRole('textbox')).toBeDefined();
    expect(screen.getByRole('button', {name: 'Next'})).toBeDefined();
  });

  it('renders a warning if there was an error', () => {
    renderDialog({error: true});

    const input = screen.getByRole('textbox');
    const message = screen.getByText(ERROR_MESSAGE);

    // The message is the field's error text: it is announced by the input
    // rather than living in unattached body copy.
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(message.id);
  });

  it('renders no warning when there was no error', () => {
    renderDialog();
    expect(screen.queryByText(ERROR_MESSAGE)).toBeNull();
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBeNull();
  });

  it('disables the next button while the url is fetched', () => {
    renderDialog({isFetching: true});
    expect(screen.getByRole('button', {name: 'Next'}).disabled).toBe(true);
  });

  it('calls the onImport prop with the url when the next button is clicked', async () => {
    const user = userEvent.setup();
    const onImport = jest.fn();
    renderDialog({onImport});

    await user.type(screen.getByRole('textbox'), 'some url');
    await user.click(screen.getByRole('button', {name: 'Next'}));

    expect(onImport).toHaveBeenCalledWith('some url');
  });
});
