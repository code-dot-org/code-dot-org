import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import ConfirmRemoveStudentDialog, {
  MINIMUM_TEST_PROPS,
} from '@cdo/apps/templates/manageStudents/ConfirmRemoveStudentDialog';

jest.mock('@cdo/locale', () => ({
  removeStudentAndRecordsHeader: jest.fn(
    ({studentName}) => `Remove ${studentName} and their records`
  ),
  removeUnusedStudentHeader: jest.fn(
    ({studentName}) => `Remove unused student ${studentName}`
  ),
  removeStudentBody1: jest.fn(
    () => 'This will remove the student and their records.'
  ),
  learnMore: jest.fn(() => 'Learn more'),
  removeStudentBody2: jest.fn(
    () => 'This student depends on this section for login.'
  ),
  removeStudentSendHomeInstructions: jest.fn(() => 'Send home instructions'),
  removeStudent: jest.fn(() => 'Remove Student'),
  dialogOK: jest.fn(() => 'OK'),
  cancel: jest.fn(() => 'Cancel'),
  closeDialog: jest.fn(() => 'Close'),
}));

describe('ConfirmRemoveStudentDialog', () => {
  const defaultProps = {
    ...MINIMUM_TEST_PROPS,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with the correct header when the student has signed in', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={true} />
    );

    expect(
      screen.getByText('Remove Clark Kent and their records')
    ).toBeInTheDocument();
    expect(
      screen.getByText('This will remove the student and their records.')
    ).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('renders the dialog with the correct header when the student has never signed in', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={false} />
    );

    expect(
      screen.getByText('Remove unused student Clark Kent')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This will remove the student and their records.')
    ).not.toBeInTheDocument();
  });

  it('renders the "send home instructions" button when the student depends on this section for login', () => {
    render(
      <ConfirmRemoveStudentDialog
        {...defaultProps}
        hasEverSignedIn={true}
        dependsOnThisSectionForLogin={true}
      />
    );

    expect(
      screen.getByText('This student depends on this section for login.')
    ).toBeInTheDocument();
    expect(screen.getByText('Send home instructions')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={true} />
    );

    const confirmButton = screen.getByText('Remove Student');
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={true} />
    );

    const cancelButton = screen.getByRole('button', {name: /cancel/i});
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('disables the confirm and cancel buttons when the disabled prop is true', () => {
    render(
      <ConfirmRemoveStudentDialog
        {...defaultProps}
        hasEverSignedIn={true}
        disabled={true}
      />
    );

    const confirmButton = screen.getByRole('button', {name: /Remove Student/i});
    const cancelButton = screen.getByRole('button', {name: /cancel/i});

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('does not render the "learn more" link when the student has never signed in', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={false} />
    );

    expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
  });
});
