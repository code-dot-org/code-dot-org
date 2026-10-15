import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useRef} from 'react';

import {hashEmail} from '@cdo/apps/code-studio/hashEmail';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import RailsAuthenticityToken from '../lib/util/RailsAuthenticityToken';

import commonStyles from './common/common.styles.module.scss';
import styles from './create-personal-login.module.scss';

// Mirrors the guard in code-studio/hashEmail.js: we only hash + clear a value
// that actually looks like an email address, so leaving the field blank does
// not overwrite the server-provided hashed_email with md5("").
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const UPGRADE_URL = '/users/upgrade';

// DSCO TextField requires an onChange handler. These fields are uncontrolled
// (submitted natively by the browser), so a single shared no-op suffices.
const noop = () => {};

interface CreatePersonalLoginProps {
  /** Whether linking a new personal account is currently permitted. When
   * false, the form is dimmed/disabled and the lock overlay is shown. */
  linkingEnabled?: boolean;
  /** Under-13 branch: render a username + parent-email instead of an email. */
  noEmail?: boolean;
  secretWordAccount?: boolean;
  /** current_user.age from Rails; null/undefined when unknown. */
  userAge?: number | null;
  hashedEmail?: string;
  heading: string;
  description: string;
  enterNewLoginInfo: string;
  usernameLabel?: string;
  /** Inline markdown (link included) for the personal-email field label. */
  emailLabelMarkdown?: string;
  passwordLabel: string;
  passwordConfirmationLabel: string;
  confirmSecretWordsHeading?: string;
  secretWordsLabel?: string;
  enterParentEmailHeading?: string;
  parentEmailLabel?: string;
  termsMarkdown?: string;
  emailNoteMarkdown?: string;
  submitLabel?: string;
  lockIconSrc?: string;
}

/**
 * "Create personal login" section of the account edit page. Renders a native
 * Rails form that POSTs to /users/upgrade to convert a teacher-/parent-managed
 * account into one with its own password login.
 *
 * The section renders across four account-state branches (linking on/off,
 * with/without a personal email) and, when locked, dims the form and shows a
 * lock overlay. All copy, markdown, and URLs are resolved Rails-side and passed
 * in from the mount point so localization stays on the server, matching the
 * other migrated sections on the page.
 *
 * The form ids (#edit_user_create_personal_account and its description) are
 * preserved because the policy_compliance UI test locates them by id.
 *
 * Privacy invariant: on submit the plaintext email is hashed into the hidden
 * hashed_email field, and for users under 13 (or of unknown age) the plaintext
 * email is cleared from the DOM before the browser serializes the request.
 */
export default function CreatePersonalLogin({
  linkingEnabled,
  noEmail,
  secretWordAccount,
  userAge,
  hashedEmail,
  heading,
  description,
  enterNewLoginInfo,
  usernameLabel,
  emailLabelMarkdown,
  passwordLabel,
  passwordConfirmationLabel,
  confirmSecretWordsHeading,
  secretWordsLabel,
  enterParentEmailHeading,
  parentEmailLabel,
  termsMarkdown,
  emailNoteMarkdown,
  submitLabel,
  lockIconSrc,
}: CreatePersonalLoginProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hashedEmailRef = useRef<HTMLInputElement>(null);
  const disabled = !linkingEnabled;

  const handleSubmit = () => {
    // Full-page POST to Rails: intentionally no preventDefault. We only massage
    // the email <-> hashed_email fields synchronously before the native submit.
    if (noEmail) {
      // The under-13 branch renders a username, not an email — nothing to hash.
      return;
    }
    const emailInput = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="user[email]"]'
    );
    if (!emailInput) {
      return;
    }
    const email = emailInput.value.toLowerCase().trim();
    if (email !== '' && EMAIL_REGEX.test(email)) {
      if (hashedEmailRef.current) {
        hashedEmailRef.current.value = hashEmail(email);
      }
      // Never transmit the plaintext email for under-13 (or age-unknown) users.
      // Mutate the DOM node directly so the cleared value is what the native
      // submit serializes; a React state update would not flush in time.
      const ageUnknownOrUnder13 =
        userAge === null || userAge === undefined || Number(userAge) < 13;
      if (ageUnknownOrUnder13) {
        emailInput.value = '';
      }
    }
  };

  // TextField types `label` as string, but FormFieldWrapper (and the DOM)
  // accept a ReactNode; the email label is inline markdown containing a link.
  // Render the node and cast to satisfy the narrower-than-runtime prop type.
  // (Widening TextField's label to ReactNode in the component library would be
  // a reasonable follow-up.)
  const emailLabel = (
    <SafeMarkdown unwrapped markdown={emailLabelMarkdown || ''} />
  ) as unknown as string;

  return (
    <div>
      <hr className={commonStyles.sectionDivider} />
      <MuiTypography variant="h5" component="h2" gutterBottom>
        {heading}
      </MuiTypography>
      <MuiTypography
        id="edit_user_create_personal_account_description"
        variant="body2"
        component="p"
        gutterBottom
      >
        {description}
      </MuiTypography>
      <div className={styles.formWrapper}>
        <form
          id="edit_user_create_personal_account"
          action={UPGRADE_URL}
          method="post"
          ref={formRef}
          onSubmit={handleSubmit}
          className={classNames(styles.form, {[styles.dimmed]: disabled})}
        >
          {/* Rails routes /users/upgrade as PATCH only. The legacy
              form_for(current_user) emitted this _method override automatically
              because the user is a persisted record; replicate it so the native
              POST is rewritten to PATCH and reaches registrations#upgrade. */}
          <input type="hidden" name="_method" value="patch" />
          <RailsAuthenticityToken />
          <input
            type="hidden"
            name="user[hashed_email]"
            defaultValue={hashedEmail || ''}
            ref={hashedEmailRef}
          />
          <MuiTypography variant="h6" component="h3">
            {enterNewLoginInfo}
          </MuiTypography>
          {noEmail ? (
            <>
              <input type="hidden" name="noEmail" value="true" />
              <TextField
                name="user[username]"
                inputType="text"
                label={usernameLabel}
                maxLength={255}
                disabled={disabled}
                onChange={noop}
              />
            </>
          ) : (
            <TextField
              name="user[email]"
              inputType="email"
              label={emailLabel}
              autoComplete="off"
              maxLength={255}
              disabled={disabled}
              onChange={noop}
            />
          )}
          <TextField
            name="user[password]"
            inputType="password"
            label={passwordLabel}
            autoComplete="off"
            maxLength={255}
            disabled={disabled}
            onChange={noop}
          />
          <TextField
            name="user[password_confirmation]"
            inputType="password"
            label={passwordConfirmationLabel}
            autoComplete="off"
            maxLength={255}
            disabled={disabled}
            onChange={noop}
          />
          {linkingEnabled && (
            <>
              {secretWordAccount && (
                <>
                  <MuiTypography variant="h6" component="h3">
                    {confirmSecretWordsHeading}
                  </MuiTypography>
                  <TextField
                    name="user[secret_words]"
                    inputType="text"
                    label={secretWordsLabel}
                    autoComplete="off"
                    maxLength={255}
                    disabled={disabled}
                    onChange={noop}
                  />
                </>
              )}
              {noEmail && (
                <>
                  <MuiTypography variant="h6" component="h3">
                    {enterParentEmailHeading}
                  </MuiTypography>
                  <TextField
                    name="user[parent_email]"
                    inputType="text"
                    label={parentEmailLabel}
                    maxLength={255}
                    disabled={disabled}
                    onChange={noop}
                  />
                </>
              )}
              <SafeMarkdown
                className={styles.legalText}
                markdown={termsMarkdown || ''}
              />
              {!noEmail && (
                <SafeMarkdown
                  className={styles.legalText}
                  markdown={emailNoteMarkdown || ''}
                />
              )}
              <div>
                <MuiButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {submitLabel}
                </MuiButton>
              </div>
            </>
          )}
        </form>
        {disabled && (
          <div className={styles.lockOverlay}>
            <img className={styles.lockIcon} src={lockIconSrc} alt="" />
          </div>
        )}
      </div>
    </div>
  );
}
