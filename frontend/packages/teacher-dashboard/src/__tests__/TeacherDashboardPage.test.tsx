// TDF-SHELL-01 (scaffold, F0-T10): the package's default export renders and
// is accessibility-clean.
// TDF-SHELL-03 (F0-T11): the placeholder renders the fixture-served section
// names under `sections-many-ordered` and the empty state under
// `sections-empty`, driven by the core MSW handlers via `setActiveScenario`.

import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {axe} from 'vitest-axe';

import {QueryClientProvider} from '@code-dot-org/core/api';
import {
  clearActiveScenario,
  setActiveScenario,
} from '@code-dot-org/core/api/mocks';

import TeacherDashboardPage from '../index';
import {TEACHER_DASHBOARD_LAB_KEY} from '../mocks/scenarios';

afterEach(() => clearActiveScenario());

function renderPage() {
  return render(
    <QueryClientProvider defaultOptions={{queries: {retry: false}}}>
      <TeacherDashboardPage />
    </QueryClientProvider>,
  );
}

describe('TeacherDashboardPage (TDF-SHELL-01)', () => {
  it('renders', () => {
    const {container} = renderPage();
    expect(container).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const {container} = renderPage();
    await screen.findAllByRole('listitem');
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('TeacherDashboardPage fixture-driven content (TDF-SHELL-03)', () => {
  it('renders every section name under sections-many-ordered', async () => {
    setActiveScenario({
      labKey: TEACHER_DASHBOARD_LAB_KEY,
      tag: 'sections-many-ordered',
    });
    renderPage();

    expect(
      await screen.findByText('SDD Fixture: scriptless'),
    ).toBeInTheDocument();
    expect(screen.getByText('SDD Fixture: scripted')).toBeInTheDocument();
    expect(screen.getByText('SDD Fixture: unit_group')).toBeInTheDocument();
  });

  it('renders the empty state under sections-empty', async () => {
    setActiveScenario({
      labKey: TEACHER_DASHBOARD_LAB_KEY,
      tag: 'sections-empty',
    });
    renderPage();

    expect(
      await screen.findByText(/don.t have any sections yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
