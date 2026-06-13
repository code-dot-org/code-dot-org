import type {SectionProps} from './types';

// Read-only skeleton (task 5.2). Editable name fields with field-level server
// validation land in task 5.4.
export default function MyInformation({settings}: SectionProps) {
  const isTeacher = settings.userType === 'teacher';
  return (
    <section aria-labelledby="my-information-heading">
      <h2 id="my-information-heading">My Information</h2>
      <dl>
        <dt>First name</dt>
        <dd>{settings.givenName || '—'}</dd>
        {isTeacher && (
          <>
            <dt>Last name</dt>
            <dd>{settings.familyName || '—'}</dd>
          </>
        )}
        <dt>Display name</dt>
        <dd>{settings.displayName}</dd>
      </dl>
    </section>
  );
}
