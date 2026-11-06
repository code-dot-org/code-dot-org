import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';

import LabModal from '@cdo/apps/lab2/views/dialogs/LabModal';

const renderModal = (
  props: Partial<React.ComponentProps<typeof LabModal>> = {}
) => {
  const onClose = jest.fn();
  render(
    <ThemeProvider>
      <LabModal
        title="All scenes"
        onClose={onClose}
        primaryButtonProps={{children: 'Done'}}
        {...props}
      >
        <p id="dsco-dialog-description">The scenes of this game.</p>
      </LabModal>
    </ThemeProvider>
  );
  return onClose;
};

describe('LabModal', () => {
  it('names the dialog after its title and shows the content and buttons', () => {
    renderModal({secondaryButtonProps: {children: 'Add a scene'}});
    const dialog = screen.getByRole('dialog', {name: 'All scenes'});
    expect(
      within(dialog).getByRole('heading', {level: 2, name: 'All scenes'})
    ).toBeTruthy();
    expect(dialog.textContent).toContain('The scenes of this game.');
    expect(
      within(dialog)
        .getAllByRole('button')
        .map(button => button.textContent || button.getAttribute('aria-label'))
    ).toEqual(['Add a scene', 'Done', 'Close dialog']);
  });

  it('has no secondary button unless given one', () => {
    renderModal();
    expect(screen.queryByRole('button', {name: 'Add a scene'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Done'})).toBeTruthy();
  });

  it('closes from the corner x and from Escape', () => {
    const onClose = renderModal({closeLabel: 'Close the scenes'});
    fireEvent.click(screen.getByRole('button', {name: 'Close the scenes'}));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
