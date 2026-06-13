import type {SectionProps} from './types';

// Read-only skeleton (task 5.2). The account-type confirmation modal and the
// delete-account alertdialog flow land in task 5.8.
export default function AccountActions({settings}: SectionProps) {
  return (
    <section aria-labelledby="account-actions-heading">
      <h2 id="account-actions-heading">Account Actions</h2>
      <dl>
        <dt>Account type</dt>
        <dd>{settings.userType === 'teacher' ? 'Educator' : 'Student'}</dd>
      </dl>
    </section>
  );
}
