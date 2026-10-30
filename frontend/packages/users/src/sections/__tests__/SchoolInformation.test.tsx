import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {
  createQueryClient,
  QueryClientProvider,
  type UserSettings,
} from '@code-dot-org/core/api';

import SchoolInformation from '../SchoolInformation';

const SCHOOL = {
  schoolName: 'Example Elementary School',
  schoolType: 'public',
  schoolId: '100000000001',
  schoolZip: '98101',
  country: 'US',
};

function renderSection(settings: Partial<UserSettings>) {
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <ToastProvider politeness="polite">
        <SchoolInformation
          settings={{userType: 'teacher', ...settings} as UserSettings}
        />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('SchoolInformation', () => {
  it('shows the stored school name in a read-only field', () => {
    renderSection({schoolInfo: SCHOOL});

    expect(
      screen.getByRole('heading', {level: 2, name: 'School Information'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Keep your school information up-to-date.'),
    ).toBeInTheDocument();

    const field = screen.getByRole('textbox', {name: 'My school'});
    expect(field).toHaveValue('Example Elementary School');
    expect(field).toHaveAttribute('readonly');
  });

  it('shows an empty value and a hint when there is no school on record', () => {
    renderSection({schoolInfo: null});

    const field = screen.getByRole('textbox', {name: 'My school'});
    expect(field).toHaveValue('');
    // The hint must describe the field, not just sit next to it.
    expect(field).toHaveAccessibleDescription('No school on record yet.');
  });

  it('treats an absent schoolInfo as empty', () => {
    renderSection({});
    expect(screen.getByRole('textbox', {name: 'My school'})).toHaveValue('');
  });

  it('opens the update-school dialog', async () => {
    renderSection({schoolInfo: SCHOOL});

    fireEvent.click(screen.getByRole('button', {name: 'Update my school'}));

    expect(
      await screen.findByRole('dialog', {
        name: 'Update your school information',
      }),
    ).toBeInTheDocument();
  });
});
