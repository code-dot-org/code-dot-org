import {Box, Button, Typography} from '@mui/material';
import {useEffect, useState, type ReactNode} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {FormError} from '@code-dot-org/component-library/form';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useDeleteUser,
  type UserSettings,
} from '@code-dot-org/core/api';

import styles from './DeleteUserModal.module.css';
import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

// Legal and safety copy carried over from the legacy dialog's i18n strings; the
// curly apostrophes are theirs. Wording here is a product decision, not a style one.
const VERIFICATION_STRING = 'DELETE MY ACCOUNT';
const VERIFICATION_LABEL = `To verify, type ${VERIFICATION_STRING} below:`;
const PASSWORD_LABEL = 'Current password:';
const RECOVERY =
  'If you delete your account and change your mind, you can email us at support@code.org within 3 weeks to recover your account.';

const RELEASE_RECORDS_URL =
  'https://support.code.org/hc/en-us/articles/360015983631';
const ADD_PERSONAL_LOGIN_URL =
  'https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account';

// Only a teacher whose students depend on them for login sees these; every other
// account saw zero checkboxes in legacy and still had to type the string.
const ACK_LABELS: ReactNode[] = [
  <>
    <strong>I have the authority to delete the education records </strong>
    of the students in my sections (or release it to them, if they have a
    personal login).{' '}
    <Link href={RELEASE_RECORDS_URL} openInNewTab className={styles.inlineLink}>
      Learn more
    </Link>
  </>,
  <>
    I am aware of the{' '}
    <Link
      href={ADD_PERSONAL_LOGIN_URL}
      openInNewTab
      className={styles.inlineLink}
    >
      message to send to parents
    </Link>{' '}
    to warn them that their children’s coding projects will be deleted unless
    they act to preserve it by creating a personal login for their children.
  </>,
  <>
    I understand that by deleting my account,{' '}
    <strong>my students’ accounts may also be permanently deleted.</strong>
  </>,
  <>
    I understand that by deleting my account,{' '}
    <strong>
      my students may not be able to access their accounts anymore.
    </strong>
  </>,
  <>
    I understand that by deleting my account,{' '}
    <strong>
      the projects and creations of my students may also be deleted.
    </strong>
  </>,
];

/**
 * Destructive delete-account flow. A teacher whose students depend on them for
 * login passes a guidance step first, then acknowledges all five statements; every
 * account types the verification string and supplies its password where it has
 * one. Confirm is a click-only button, never a submit, so Enter cannot delete an
 * account.
 */
export default function DeleteUserModal({
  open,
  onClose,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
}) {
  const mutation = useDeleteUser(DashboardApiClient);
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [password, setPassword] = useState('');
  const [acks, setAcks] = useState(() => ACK_LABELS.map(() => false));
  const [verification, setVerification] = useState('');
  const [pastGuidance, setPastGuidance] = useState(false);

  const isTeacher = settings.userType === 'teacher';
  const dependents = settings.dependentStudentsCount;
  const dependedUponForLogin = isTeacher && dependents > 0;
  const requiresPassword = settings.hasPassword;

  // isSuccess keeps the button dead between the request resolving and the
  // navigation landing, so a second click cannot fire against a deleted session.
  const canDelete =
    verification === VERIFICATION_STRING &&
    (!dependedUponForLogin || acks.every(Boolean)) &&
    (!requiresPassword || password.length > 0) &&
    !mutation.isPending &&
    !mutation.isSuccess;

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setAcks(ACK_LABELS.map(() => false));
    setVerification('');
    setPastGuidance(false);
  }, [open]);

  const close = () => {
    resetErrors();
    onClose();
  };

  const deleteAccount = onSubmit(async () => {
    if (!canDelete) return;
    await mutation.mutateAsync(requiresPassword ? {password} : {});
    // The server signs the user out; leave the SPA.
    window.location.assign('/');
  });

  const showGuidance = dependedUponForLogin && !pastGuidance;

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="delete-account-title"
      title="Are you sure you want to delete your account?"
      describedById="delete-account-desc"
      alert
      // Nothing submits this form; the destructive action is click-only.
      onSubmit={event => event.preventDefault()}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          {showGuidance ? (
            <Button variant="contained" onClick={() => setPastGuidance(true)}>
              Next
            </Button>
          ) : (
            <Button
              color="error"
              variant="contained"
              disabled={!canDelete}
              onClick={deleteAccount}
            >
              {dependedUponForLogin
                ? "Delete my and my students' accounts"
                : 'Delete my Account'}
            </Button>
          )}
        </>
      }
    >
      {showGuidance ? (
        <Box id="delete-account-desc">
          <Typography variant="body2" sx={{mb: 2}}>
            You have {dependents} or more students that log into CodeAI via
            secret words, secret pictures, or a third-party service and might
            not have set up a personal login. Deleting your account may also
            delete the accounts of many of those students unless they create a
            personal login for their {dependents === 1 ? 'account' : 'accounts'}{' '}
            first:
          </Typography>
          <Typography variant="body2" sx={{mb: 2}}>
            Please give your students a chance to keep using their CodeAI
            accounts by{' '}
            <strong>sending these instructions home with them </strong>
            on how they can create a personal login. Give them at least a few
            days to follow these instructions BEFORE you delete your account.
          </Typography>
          <Box sx={{mb: 2}}>
            <Link href={ADD_PERSONAL_LOGIN_URL} openInNewTab>
              Send home instructions for creating a personal login
            </Link>
          </Box>
          <Typography variant="body2">
            If you have already done this, click “Next” to continue with account
            deletion.
          </Typography>
        </Box>
      ) : (
        <>
          <Box id="delete-account-desc">
            <Alert
              type="danger"
              size="s"
              text={
                <>
                  <strong>WARNING</strong>: Deleting your account will{' '}
                  <strong>permanently erase</strong>{' '}
                  {isTeacher
                    ? 'all your personal information, coursework, projects, and professional learning information linked to this account after 28 days.'
                    : 'all your personal information, coursework, and projects linked to this account after 28 days.'}{' '}
                  {/* The section is only the button, so every teacher needs the
                      full disclaimer here — including one with no dependents, who
                      sees neither the guidance step nor the acknowledgments. This
                      wording subsumes the legacy dialog's shorter students line. */}
                  {isTeacher && (
                    <>
                      It will also{' '}
                      <strong>
                        delete your sections and your students’ accounts
                      </strong>{' '}
                      that don’t have a personal login or aren’t in another
                      teacher’s section. Please make sure you have the authority
                      to delete these students’ education records before
                      deleting your own account.
                    </>
                  )}
                </>
              }
            />
          </Box>
          <FormError message={errors.formError} />
          {dependedUponForLogin && (
            <Box>
              <Typography variant="body2" sx={{fontWeight: 600, mb: 1}}>
                {`Please verify the following ${ACK_LABELS.length} statements before you can delete your account:`}
              </Typography>
              {ACK_LABELS.map((label, index) => (
                <Box key={index} sx={{mb: 1}}>
                  <Checkbox
                    className={styles.acknowledgment}
                    name={`ack-${index}`}
                    checked={acks[index]}
                    onChange={event =>
                      setAcks(previous =>
                        previous.map((value, i) =>
                          i === index ? event.target.checked : value,
                        ),
                      )
                    }
                    label={label}
                  />
                </Box>
              ))}
            </Box>
          )}
          {requiresPassword && (
            <TextField
              label={PASSWORD_LABEL}
              name="currentPassword"
              inputType="password"
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              errorMessage={errors.fieldErrors.current_password?.[0]}
            />
          )}
          <TextField
            label={VERIFICATION_LABEL}
            name="deleteVerification"
            value={verification}
            onChange={event => setVerification(event.target.value)}
            autoComplete="off"
          />
          <Typography variant="body3">{RECOVERY}</Typography>
        </>
      )}
    </FormDialog>
  );
}
