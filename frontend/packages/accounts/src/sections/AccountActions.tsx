import Section from './Section';
import type {SectionProps} from './types';

// Read-only for now. The account-type confirmation modal and the delete-account
// alertdialog flow land in task 5.8.
export default function AccountActions({settings}: SectionProps) {
  return (
    <Section id="account-actions" title="Account Actions">
      <dl>
        <dt>Account type</dt>
        <dd>{settings.userType === 'teacher' ? 'Educator' : 'Student'}</dd>
      </dl>
    </Section>
  );
}
