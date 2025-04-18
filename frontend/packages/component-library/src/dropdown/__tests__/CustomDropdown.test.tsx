import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {CustomDropdown} from './../index';

describe('Design System - Custom Dropdown Component', () => {
  it('renders with correct text and children', () => {
    render(
      <CustomDropdown name="test-dropdown" labelText="Dropdown label" size="m">
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    expect(screen.getByText('Dropdown label')).toBeInTheDocument();
    expect(screen.getByText('Dropdown content')).toBeInTheDocument();
  });

  it('opens and closes when clicked', async () => {
    const user = userEvent.setup();
    render(
      <CustomDropdown name="test-dropdown" labelText="Dropdown label" size="m">
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    const dropdownButton = screen.getByRole('button', {
      name: /test-dropdown filter dropdown/i,
    });

    // Initially dropdown content should not be visible
    const dropdownContainer =
      screen.getByText('Dropdown content').parentElement;
    expect(dropdownContainer).not.toHaveClass('open');

    // Click to open dropdown
    await user.click(dropdownButton);

    // Now dropdown should be visible
    expect(dropdownButton.parentElement).toHaveClass('open');

    // Click again to close dropdown
    await user.click(dropdownButton);

    // Dropdown should be closed again
    expect(dropdownButton.parentElement).not.toHaveClass('open');
  });

  it("doesn't open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <CustomDropdown
        name="test-dropdown"
        labelText="Dropdown label"
        disabled
        size="m"
      >
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    const dropdownButton = screen.getByRole('button', {
      name: /test-dropdown filter dropdown/i,
    });
    expect(dropdownButton).toBeDisabled();

    await user.click(dropdownButton);

    // Dropdown should remain closed
    expect(dropdownButton.parentElement).not.toHaveClass('open');
  });

  it('renders with a custom icon', () => {
    render(
      <CustomDropdown
        name="test-dropdown"
        labelText="Dropdown label"
        size="m"
        icon={{iconName: 'filter', iconStyle: 'solid', title: 'Filter Icon'}}
      >
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    const icon = screen.getByTitle('Filter Icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with DSCO button as trigger', () => {
    render(
      <CustomDropdown
        name="test-dropdown"
        labelText="Dropdown label"
        size="m"
        useDSCOButtonAsTrigger={true}
        triggerButtonProps={{
          text: 'DSCO Button',
          color: 'purple',
          type: 'primary',
        }}
      >
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    // The aria-label on the button is set to the CustomDropdown name prop
    // (a unique identifier not show to users) and ` filter dropdown`.
    const button = screen.getByRole('button', {
      name: 'test-dropdown filter dropdown',
    });
    expect(button).toBeInTheDocument();
  });

  it('renders with helper message and icon', () => {
    render(
      <CustomDropdown
        name="test-dropdown"
        labelText="Dropdown label"
        size="m"
        helperMessage="This is a helper message"
        helperIcon={{iconName: 'info-circle', iconStyle: 'solid'}}
      >
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    expect(screen.getByText('This is a helper message')).toBeInTheDocument();
    const helperIcon = document.querySelector('i.fa-info-circle');
    expect(helperIcon).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(
      <CustomDropdown
        name="test-dropdown"
        labelText="Dropdown label"
        size="m"
        errorMessage="This is an error message"
      >
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    expect(screen.getByText('This is an error message')).toBeInTheDocument();
    const errorIcon = document.querySelector('i.fa-circle-exclamation');
    expect(errorIcon).toBeInTheDocument();
    expect(screen.getByRole('button').parentElement).toHaveClass('hasError');
  });

  it('renders as form field with selected value', () => {
    render(
      <CustomDropdown
        name="test-dropdown"
        labelText="Dropdown label"
        size="m"
        styleAsFormField={true}
        selectedValueText="Selected Option"
      >
        <div>Dropdown content</div>
      </CustomDropdown>,
    );

    expect(screen.getByText('Dropdown label')).toBeInTheDocument();
    expect(screen.getByText('Selected Option')).toBeInTheDocument();
    expect(screen.getByRole('button').parentElement).toHaveClass(
      'styleAsFormField',
    );
  });
});
