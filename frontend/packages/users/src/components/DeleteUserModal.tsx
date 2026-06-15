import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {useState, type ReactNode} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useDeleteUser,
  type UserSettings,
} from '@code-dot-org/core/api';

import {focusFirstControl, formDialogContentSx} from './formDialog';
import FormError from './FormError';
import {useModalForm} from './useModalForm';

// Legal copy reproduced verbatim from legacy /users/edit; curly apostrophes are
// intentional. Links open in a new tab.
const RELEASE_RECORDS_URL =
  'https://support.code.org/hc/en-us/articles/360015983631';
const ADD_PERSONAL_LOGIN_URL =
  'https://support.code.org/hc/en-us/articles/115001475131-Adding-a-personal-login-to-a-teacher-created-account';

// A teacher whose students rely on them to log in must acknowledge the
// education-records consequences and type this string to delete.
const VERIFICATION_STRING = 'DELETE MY ACCOUNT';

type AckId = 1 | 2 | 3 | 4 | 5;
const ACK_IDS: AckId[] = [1, 2, 3, 4, 5];
const ACKS_UNCHECKED: Record<AckId, boolean> = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
};

function ExternalLink({href, children}: {href: string; children: ReactNode}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const ACK_LABELS: Record<AckId, ReactNode> = {
  1: (
    <span>
      <strong>I have the authority to delete the education records </strong>
      of the students in my sections (or release it to them, if they have a
      personal login).{' '}
      <ExternalLink href={RELEASE_RECORDS_URL}>Learn more</ExternalLink>
    </span>
  ),
  2: (
    <span>
      I am aware of the{' '}
      <ExternalLink href={ADD_PERSONAL_LOGIN_URL}>
        message to send to parents{' '}
      </ExternalLink>
      to warn them that their children’s coding projects will be deleted unless
      they act to preserve it by creating a personal login for their children.
    </span>
  ),
  3: (
    <span>
      I understand that by deleting my account,{' '}
      <strong>my students’ accounts may also be permanently deleted.</strong>
    </span>
  ),
  4: (
    <span>
      I understand that by deleting my account,{' '}
      <strong>
        my students may not be able to access their accounts anymore.
      </strong>
    </span>
  ),
  5: (
    <span>
      I understand that by deleting my account,{' '}
      <strong>
        the projects and creations of my students may also be deleted.
      </strong>
    </span>
  ),
};

/**
 * Destructive delete-account alertdialog. Requires explicit acknowledgment (and
 * the password where the account has one) before DELETE /users. A teacher whose
 * students depend on them for login must instead acknowledge five
 * education-records consequences and type a verification string — legacy parity
 * for a compliance-sensitive flow. The password/checkbox field takes initial
 * focus, never the destructive button, whose name states the consequence.
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
  const [acknowledged, setAcknowledged] = useState(false);
  const [acks, setAcks] = useState<Record<AckId, boolean>>(ACKS_UNCHECKED);
  const [verification, setVerification] = useState('');

  const dependedUponForLogin =
    settings.userType === 'teacher' && settings.dependentStudentsCount > 0;
  const requiresPassword = settings.hasPassword;

  const acknowledgedConsequences = dependedUponForLogin
    ? ACK_IDS.every(id => acks[id]) && verification === VERIFICATION_STRING
    : acknowledged;
  const canDelete =
    acknowledgedConsequences && (!requiresPassword || password.length > 0);

  const close = () => {
    setPassword('');
    setAcknowledged(false);
    setAcks(ACKS_UNCHECKED);
    setVerification('');
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync(requiresPassword ? {password} : {});
    // The server signs the user out; leave the SPA.
    window.location.assign('/');
  });

  const dependents = settings.dependentStudentsCount;

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      slotProps={{
        paper: {role: 'alertdialog'},
        transition: {onEntered: focusFirstControl},
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="delete-account-title">Delete my account</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          <DialogContentText id="delete-account-desc">
            This permanently deletes your account
            {dependents > 0
              ? ` and the ${dependents} dependent student account${dependents === 1 ? '' : 's'} you manage`
              : ''}
            . This can’t be undone.
          </DialogContentText>
          {dependedUponForLogin && (
            <DialogContentText>
              Deleting your account will permanently erase all personal
              information, coursework, projects, and professional learning
              information connected to this account after 28 days.{' '}
              <strong>
                It will also delete your sections and your students’ accounts
              </strong>{' '}
              that don’t have a personal login or aren’t in another teacher’s
              section. Please make sure you have the authority to delete these
              students’ education records before deleting your own account.
            </DialogContentText>
          )}
          <FormError message={errors.formError} />
          {requiresPassword && (
            <TextField
              label="Password"
              name="password_confirmation"
              inputType="password"
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              errorMessage={errors.fieldErrors.current_password?.[0]}
              aria-invalid={
                errors.fieldErrors.current_password ? true : undefined
              }
            />
          )}
          {dependedUponForLogin ? (
            <>
              {ACK_IDS.map(id => (
                <FormControlLabel
                  key={id}
                  // mx:0 — the shared dialog sx forces width:100%, and
                  // MuiFormControlLabel's default -11px/+16px margins then
                  // overflow the content box (x-scroll).
                  sx={{mx: 0}}
                  control={
                    <Checkbox
                      checked={acks[id]}
                      onChange={event =>
                        setAcks(prev => ({...prev, [id]: event.target.checked}))
                      }
                    />
                  }
                  label={ACK_LABELS[id]}
                />
              ))}
              <TextField
                label={`Type ${VERIFICATION_STRING} to confirm`}
                name="delete_verification"
                value={verification}
                onChange={event => setVerification(event.target.value)}
              />
            </>
          ) : (
            <FormControlLabel
              // mx:0 — see note above.
              sx={{mx: 0}}
              control={
                <Checkbox
                  checked={acknowledged}
                  onChange={event => setAcknowledged(event.target.checked)}
                />
              }
              label="I understand this is permanent."
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            color="error"
            variant="contained"
            disabled={!canDelete || mutation.isPending}
          >
            Delete my account
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
