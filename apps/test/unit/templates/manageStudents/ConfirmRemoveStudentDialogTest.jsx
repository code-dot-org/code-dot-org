import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ConfirmRemoveStudentDialog, {
  MINIMUM_TEST_PROPS,
} from '@cdo/apps/templates/manageStudents/ConfirmRemoveStudentDialog';
import i18n from '@cdo/locale';

const studentName = MINIMUM_TEST_PROPS.studentName;

describe('ConfirmRemoveStudentDialog', () => {
  const defaultProps = {
    ...MINIMUM_TEST_PROPS,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  const getRemoveStudentButton = () =>
    screen.getByRole('button', {name: RegExp(i18n.removeStudent(), 'i')});
  const getCancelButton = () =>
    screen.getByRole('button', {name: RegExp(i18n.cancel(), 'i')});

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with the correct header when the student has signed in', () => {
    i18n.removeStudentBody1 = jest.fn(
      () => 'This will remove the student and their records.'
    );
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={true} />
    );

    expect(
      screen.getByText(i18n.removeStudentAndRecordsHeader({studentName}))
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.removeStudentBody1())).toBeInTheDocument();
    expect(screen.getByText(i18n.learnMore())).toBeInTheDocument();
  });

  it('renders the dialog with the correct header when the student has never signed in', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={false} />
    );

    expect(
      screen.getByText(i18n.removeUnusedStudentHeader({studentName}))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(i18n.removeStudentBody1())
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

    expect(screen.getByText(i18n.removeStudentBody2())).toBeInTheDocument();
    expect(
      screen.getByText(i18n.removeStudentSendHomeInstructions())
    ).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={true} />
    );
    await user.click(getRemoveStudentButton());

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={true} />
    );

    await user.click(getCancelButton());

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

    expect(getRemoveStudentButton()).toBeDisabled();
    expect(getCancelButton()).toBeDisabled();
  });

  it('does not render the "learn more" link when the student has never signed in', () => {
    render(
      <ConfirmRemoveStudentDialog {...defaultProps} hasEverSignedIn={false} />
    );

    expect(screen.queryByText(i18n.learnMore())).not.toBeInTheDocument();
  });
});
