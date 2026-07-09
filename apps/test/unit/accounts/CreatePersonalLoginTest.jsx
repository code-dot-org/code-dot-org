import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import md5 from 'md5';
import React from 'react';

import CreatePersonalLogin from '@cdo/apps/accounts/CreatePersonalLogin';

// A fully-populated set of props for the linking-enabled, has-email branch.
// Individual tests override the state flags to exercise the other branches.
const defaultProps = {
  linkingEnabled: true,
  noEmail: false,
  secretWordAccount: false,
  userAge: 16,
  hashedEmail: 'server-provided-hash',
  heading: 'Create a personal password login',
  description: 'Create your own login below.',
  enterNewLoginInfo: 'Enter your new login information',
  usernameLabel: "Username (don't use your real name!)",
  emailLabelMarkdown:
    'Personal email address [(no email?)](/users/edit/?noEmail=true)',
  passwordLabel: 'Password',
  passwordConfirmationLabel: 'Password confirmation',
  confirmSecretWordsHeading: 'Confirm your secret words',
  secretWordsLabel: 'Secret words',
  enterParentEmailHeading: "Enter your parent's email",
  parentEmailLabel: 'Parent/guardian email address',
  termsMarkdown: 'I agree to the [terms of service](https://code.org/tos).',
  emailNoteMarkdown: 'See our [privacy policy](https://code.org/privacy).',
  submitLabel: 'Submit',
  lockIconSrc: '/assets/auth/lock.svg',
};

const renderComponent = (props = {}) =>
  render(<CreatePersonalLogin {...defaultProps} {...props} />);

const getEmailField = () => screen.getByLabelText(/Personal email address/);
const queryEmailField = () => screen.queryByLabelText(/Personal email address/);
// Hidden inputs and the decorative lock icon have no semantic query; read them
// off the document (document.querySelector is not one of the restricted RTL
// anti-patterns, unlike container.querySelector / getByTestId).
const hashedEmailValue = () =>
  document.querySelector('input[name="user[hashed_email]"]').value;

describe('CreatePersonalLogin', () => {
  beforeEach(() => {
    // RailsAuthenticityToken reads these meta tags to emit the CSRF hidden
    // field; without them the token input silently renders nothing.
    document.head.innerHTML =
      '<meta name="csrf-param" content="authenticity_token">' +
      '<meta name="csrf-token" content="test-csrf-token">';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('POSTs to /users/upgrade with a CSRF token and preserved ids', () => {
    renderComponent();
    const form = screen.getByRole('button', {name: 'Submit'}).closest('form');
    expect(form).toHaveAttribute('id', 'edit_user_create_personal_account');
    expect(form).toHaveAttribute('action', '/users/upgrade');
    expect(form).toHaveAttribute('method', 'post');
    // /users/upgrade is routed as PATCH only; the POST must carry Rails' method
    // override so it is rewritten to PATCH and reaches registrations#upgrade.
    expect(document.querySelector('input[name="_method"]')).toHaveValue(
      'patch'
    );
    expect(
      document.getElementById('edit_user_create_personal_account_description')
    ).toBeInTheDocument();
    expect(
      document.querySelector('input[name="authenticity_token"]')
    ).toHaveValue('test-csrf-token');
  });

  describe('when linking is disabled', () => {
    const lockedProps = {linkingEnabled: false};

    it('disables the inputs and shows the lock overlay', () => {
      renderComponent(lockedProps);
      expect(getEmailField()).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
      expect(screen.getByLabelText('Password confirmation')).toBeDisabled();
      expect(document.querySelector('img')).toBeInTheDocument();
    });

    it('renders the description and hides the submit button', () => {
      renderComponent({...lockedProps, description: 'Provide your state.'});
      expect(screen.getByText('Provide your state.')).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: 'Submit'})).toBeNull();
    });
  });

  describe('when linking is enabled with a personal email', () => {
    it('renders the email field, ToS + privacy markdown, and an enabled submit', () => {
      renderComponent();
      expect(getEmailField()).toBeEnabled();
      expect(
        screen.queryByLabelText("Username (don't use your real name!)")
      ).toBeNull();
      screen.getByRole('link', {name: 'terms of service'});
      screen.getByRole('link', {name: 'privacy policy'});
      expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
    });
  });

  describe('when linking is enabled for an under-13 (noEmail) account', () => {
    const under13Props = {noEmail: true, userAge: 10};

    it('renders username + parent-email fields and the noEmail hidden input', () => {
      renderComponent(under13Props);
      expect(
        screen.getByLabelText("Username (don't use your real name!)")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Parent/guardian email address')
      ).toBeInTheDocument();
      expect(document.querySelector('input[name="noEmail"]')).toHaveValue(
        'true'
      );
    });

    it('renders no email field and no privacy-note markdown', () => {
      renderComponent(under13Props);
      expect(queryEmailField()).toBeNull();
      expect(screen.queryByRole('link', {name: 'privacy policy'})).toBeNull();
      // ToS still renders for the linking-enabled under-13 branch.
      screen.getByRole('link', {name: 'terms of service'});
    });
  });

  it('renders the secret-words field for a secret-word account', () => {
    renderComponent({secretWordAccount: true});
    expect(screen.getByLabelText('Secret words')).toBeInTheDocument();
  });

  it('does not render the secret-words field for a non-secret-word account', () => {
    renderComponent({secretWordAccount: false});
    expect(screen.queryByLabelText('Secret words')).toBeNull();
  });

  describe('on submit', () => {
    const submitForm = () => {
      const form = screen.getByRole('button', {name: 'Submit'}).closest('form');
      // The component intentionally does not preventDefault (this is a
      // full-page POST); stop the default here so jsdom does not attempt to
      // navigate.
      form.addEventListener('submit', e => e.preventDefault());
      fireEvent.submit(form);
    };

    it('hashes the normalized email into the hidden field', () => {
      renderComponent({userAge: 16});
      fireEvent.change(getEmailField(), {
        target: {value: '  Test@Example.COM '},
      });
      submitForm();

      expect(hashedEmailValue()).toBe(md5('test@example.com'));
    });

    it('keeps the plaintext email for users 13 and older', () => {
      renderComponent({userAge: 16});
      fireEvent.change(getEmailField(), {target: {value: 'teen@example.com'}});
      submitForm();

      expect(getEmailField()).toHaveValue('teen@example.com');
    });

    it('clears the plaintext email for users under 13', () => {
      renderComponent({userAge: 12});
      fireEvent.change(getEmailField(), {target: {value: 'kid@example.com'}});
      submitForm();

      expect(hashedEmailValue()).toBe(md5('kid@example.com'));
      expect(getEmailField()).toHaveValue('');
    });

    it('clears the plaintext email when the age is unknown', () => {
      renderComponent({userAge: undefined});
      fireEvent.change(getEmailField(), {
        target: {value: 'unknown@example.com'},
      });
      submitForm();

      expect(getEmailField()).toHaveValue('');
    });

    it('does not overwrite the hidden hash when the email is blank', () => {
      renderComponent({userAge: 16, hashedEmail: 'server-provided-hash'});
      submitForm();

      expect(hashedEmailValue()).toBe('server-provided-hash');
    });
  });
});
