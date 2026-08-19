import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {PopUpButton} from '@codebridge/PopUpButton/PopUpButton';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

describe('PopUpButton', () => {
  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <PopUpButton iconName="ellipsis-v" ariaLabel="File options">
          <button type="button" role="menuitem">
            Rename
          </button>
        </PopUpButton>
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', {name: 'File options'}));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toHaveStyle({visibility: 'visible'});
    });

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'File options'})).toHaveFocus();
  });
});
