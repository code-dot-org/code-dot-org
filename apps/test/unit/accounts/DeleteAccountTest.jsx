import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';

import DeleteAccount, {
  DELETE_VERIFICATION_STRING,
} from '@cdo/apps/accounts/DeleteAccount';
import * as utils from '@cdo/apps/utils';

jest.mock('@cdo/apps/utils', () => {
  let uuidCounter = 0;
  return {
    createUuid: jest.fn(() => `mock-uuid-${uuidCounter++}`),
    navigateToHref: jest.fn(),
  };
});

jest.mock('@cdo/locale', () => {
  const customStrings = {
    adminAccountDeletionDialog_header: () => 'Delete Admin Account',
    deleteAccountDialog_verificationString: () => 'DELETE',
    deleteAccount: () => 'Delete Account',
    dialogOK: () => 'OK',
    cancel: () => 'cancel',
    learnMore: () => 'Learn more',
    deleteAccountDialog_button: () => 'Confirm Delete',
    deleteAccountDialog_currentPassword: () => 'Current Password',
    deleteAccountDialog_verification: () => 'Type "DELETE" to confirm',
    personalLoginDialog_body1: ({numStudents}) =>
      `${numStudents} students depend on you for login.`,
    deleteAccountDialog_button_studentWarning: () => 'Button Student Warning',
  };
  return {
    __esModule: true,
    default: new Proxy(customStrings, {
      get: (target, prop) => {
        return prop in target ? target[prop] : () => prop;
      },
    }),
  };
});

const DEFAULT_PROPS = {
  isPasswordRequired: true,
  isTeacher: false,
  hasStudents: false,
  dependentStudentsCount: 3,
  isAdmin: false,
};

describe('DeleteAccount', () => {
  const renderComponent = (props = {}) => {
    return render(<DeleteAccount {...DEFAULT_PROPS} {...props} />);
  };

  const openDeleteAccountDialog = () => {
    fireEvent.click(screen.getByRole('button', {name: /delete account/i}));
  };

  const getPasswordInput = () => screen.getByLabelText(/current password/i);
  const getDeleteVerificationInput = () =>
    screen.getByLabelText(/Type "DELETE" to confirm/i);
  const getConfirmButton = () =>
    screen.getByRole('button', {name: /confirm delete/i});
  const getConfirmWarningButton = () =>
    screen.getByRole('button', {name: /Button Student Warning/i});
  const checkAllCheckboxes = () => {
    screen.getAllByRole('checkbox').forEach(checkbox => {
      if (!checkbox.checked) {
        fireEvent.click(checkbox);
      }
    });
  };
  const clearAllCheckboxes = () => {
    screen.getAllByRole('checkbox').forEach(checkbox => {
      if (checkbox.checked) {
        fireEvent.click(checkbox);
      }
    });
  };

  describe('DeleteAccountDialog submission', () => {
    it('is disabled if password is required and not provided', () => {
      renderComponent();
      openDeleteAccountDialog();
      fireEvent.change(getDeleteVerificationInput(), {
        target: {value: DELETE_VERIFICATION_STRING},
      });

      expect(getConfirmButton()).toBeDisabled();
    });

    it('is disabled if verification string is not provided', () => {
      renderComponent();
      openDeleteAccountDialog();
      fireEvent.change(getPasswordInput(), {target: {value: 'password'}});

      expect(getConfirmButton()).toBeDisabled();
    });

    it('is disabled if verification string is incorrect', () => {
      renderComponent();
      openDeleteAccountDialog();
      fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
      fireEvent.change(getDeleteVerificationInput(), {
        target: {value: 'incorrect'},
      });

      expect(getConfirmButton()).toBeDisabled();
    });

    describe('for students', () => {
      it('is enabled if password is not required and verification string is correct', () => {
        renderComponent({isPasswordRequired: false});
        openDeleteAccountDialog();
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });

        expect(getConfirmButton()).not.toBeDisabled();
      });

      it('is enabled if password is provided and verification string is correct', () => {
        renderComponent();
        openDeleteAccountDialog();
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });

        expect(getConfirmButton()).not.toBeDisabled();
      });
    });

    describe('for teachers', () => {
      it('displays PersonalLoginDialog with dependent student count if depended upon for login', () => {
        renderComponent({isTeacher: true, hasStudents: true});
        fireEvent.click(screen.getByRole('button', {name: /delete account/i}));

        expect(
          screen.getByText(/3 students depend on you for login/i)
        ).toBeInTheDocument();
      });

      it('is disabled if not all checkboxes are checked', () => {
        renderComponent({
          isTeacher: true,
          hasStudents: true,
        });
        openDeleteAccountDialog();
        fireEvent.click(screen.getByText('personalLoginDialog_button'));
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });
        clearAllCheckboxes();
        fireEvent.click(screen.getByText('deleteAccountDialog_checkbox1_1'));

        expect(getConfirmWarningButton()).toBeDisabled();
      });

      it('is enabled if checkboxes are checked, verification string is correct, and password not required', () => {
        renderComponent({
          isPasswordRequired: false,
          isTeacher: true,
          hasStudents: true,
        });
        openDeleteAccountDialog();
        fireEvent.click(screen.getByText('personalLoginDialog_button'));
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });
        checkAllCheckboxes();

        expect(getConfirmWarningButton()).not.toBeDisabled();
      });

      it('is enabled if checkboxes are checked, verification string is correct, and password provided and required', () => {
        renderComponent({isTeacher: true, hasStudents: true});
        openDeleteAccountDialog();
        fireEvent.click(screen.getByText('personalLoginDialog_button'));
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });
        checkAllCheckboxes();

        expect(getConfirmWarningButton()).not.toBeDisabled();
      });

      it('is enabled if there are no checkboxes, verification string is correct, and password provided and required', () => {
        renderComponent({isTeacher: true, hasStudents: false});
        openDeleteAccountDialog();
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });

        expect(getConfirmButton()).not.toBeDisabled();
      });
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      jest.spyOn($, 'ajax').mockImplementation(() => {
        return {
          done: callback => {
            callback(); // Simulate success callback
            return {fail: () => {}}; // Chainable fail method
          },
        };
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('on success', () => {
      it('navigates to root', async () => {
        renderComponent();
        openDeleteAccountDialog();
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });
        fireEvent.click(getConfirmButton());

        await waitFor(() => {
          expect(utils.navigateToHref).toHaveBeenCalledWith('/');
        });
      });
    });

    describe('on failure', () => {
      it('renders a password error if server returns one', async () => {
        jest.spyOn($, 'ajax').mockImplementation(() => {
          const deferred = $.Deferred();
          return deferred.reject({
            responseJSON: {error: {current_password: ['Incorrect password!']}},
          });
        });

        renderComponent();
        openDeleteAccountDialog();
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });
        fireEvent.click(getConfirmButton());

        await waitFor(() => {
          expect(screen.getByText('Incorrect password!')).toBeInTheDocument();
        });
      });

      it('renders a generic error if server does not return a validation error', async () => {
        jest.spyOn($, 'ajax').mockImplementation(() => {
          const deferred = $.Deferred();
          return deferred.reject({status: 400});
        });

        renderComponent();
        openDeleteAccountDialog();
        fireEvent.change(getPasswordInput(), {target: {value: 'password'}});
        fireEvent.change(getDeleteVerificationInput(), {
          target: {value: DELETE_VERIFICATION_STRING},
        });
        fireEvent.click(getConfirmButton());

        await waitFor(() => {
          expect(screen.getByText('Unexpected error: 400')).toBeInTheDocument();
        });
      });
    });

    describe('for admin', () => {
      it('displays AdminAccountDialog if trying to delete admin account', () => {
        renderComponent({isAdmin: true});
        openDeleteAccountDialog();

        expect(screen.getByText(/Delete admin account/i)).toBeInTheDocument();
      });
    });
  });
});
