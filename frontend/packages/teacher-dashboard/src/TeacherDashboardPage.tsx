// Foundation-scope placeholder (spec: teacher-dashboard-package-scaffold).
// Renders as unstyled text/list; no shell, nav, or tabs — those land in
// feature 1. Proves the MSW mocks pipeline end to end (F0-T11).

import {
  DashboardApiClient,
  useTeacherDashboardSections,
} from '@code-dot-org/core/api';

export default function TeacherDashboardPage() {
  const {data, isPending, isError} =
    useTeacherDashboardSections(DashboardApiClient);

  if (isPending) return <p>Loading sections…</p>;
  if (isError) return <p>Something went wrong loading your sections.</p>;

  if (data.sections.length === 0) {
    return <p>You don&rsquo;t have any sections yet.</p>;
  }

  return (
    <ul>
      {data.sections.map(section => (
        <li key={section.id}>{section.name}</li>
      ))}
    </ul>
  );
}
