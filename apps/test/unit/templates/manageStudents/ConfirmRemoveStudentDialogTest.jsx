import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ConfirmRemoveStudentDialog, {
  MINIMUM_TEST_PROPS,
} from '@cdo/apps/templates/manageStudents/ConfirmRemoveStudentDialog';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  ...MINIMUM_TEST_PROPS,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

const studentName = DEFAULT_PROPS.studentName;

describe('ConfirmRemoveStudentDialog', () => {
  const renderComponent = (props = {}) => {
    return render(<ConfirmRemoveStudentDialog {...DEFAULT_PROPS} {...props} />);
  };

  const getRemoveStudentButton = () =>
    screen.getByRole('button', {name: RegExp(i18n.removeStudent(), 'i')});
  const getCancelButton = () =>
    screen.getByRole('button', {name: RegExp(i18n.cancel(), 'i')});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the student has never signed in', () => {
    i18n.removeStudentBody1 = jest.fn(
      () => 'This will remove the student and their records.'
    );
    it('renders the dialog with the correct header', () => {
      renderComponent({hasEverSignedIn: false});

      expect(
        screen.getByText(i18n.removeUnusedStudentHeader({studentName}))
      ).toBeInTheDocument();
      expect(
        screen.queryByText(i18n.removeStudentBody1())
      ).not.toBeInTheDocument();
    });

    it('does not render the "learn more" link', () => {
      renderComponent({hasEverSignedIn: false});

      expect(screen.queryByText(i18n.learnMore())).not.toBeInTheDocument();
    });
  });

  describe('when students has signed in', () => {
    i18n.removeStudentBody1 = jest.fn(
      () => 'This will remove the student and their records.'
    );
    it('renders the dialog with the correct header', () => {
      renderComponent({hasEverSignedIn: true});

      expect(
        screen.getByText(i18n.removeStudentAndRecordsHeader({studentName}))
      ).toBeInTheDocument();
      expect(screen.getByText(i18n.removeStudentBody1())).toBeInTheDocument();
      expect(screen.getByText(i18n.learnMore())).toBeInTheDocument();
    });

    it('calls onConfirm when the confirm button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({hasEverSignedIn: true});
      await user.click(getRemoveStudentButton());

      expect(DEFAULT_PROPS.onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when the cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({hasEverSignedIn: true});
      await user.click(getCancelButton());

      expect(DEFAULT_PROPS.onCancel).toHaveBeenCalled();
    });

    describe('when the student depends on this section for login', () => {
      it('renders the "send home instructions" button', () => {
        renderComponent({
          hasEverSignedIn: true,
          dependsOnThisSectionForLogin: true,
        });

        expect(screen.getByText(i18n.removeStudentBody2())).toBeInTheDocument();
        expect(
          screen.getByText(i18n.removeStudentSendHomeInstructions())
        ).toBeInTheDocument();
      });
    });

    describe('when the disable prop is true', () => {
      it('disables the confirm and cancel buttons', () => {
        renderComponent({
          hasEverSignedIn: true,
          disabled: true,
        });

        expect(getRemoveStudentButton()).toBeDisabled();
        expect(getCancelButton()).toBeDisabled();
      });
    });
  });
});
