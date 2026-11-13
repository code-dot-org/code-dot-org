import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@code-dot-org/core/plugins/analytics', () => ({sendEvent: vi.fn()}));

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {sendEvent} from '@code-dot-org/core/plugins/analytics';

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../../fixtures';
import UpdateSchoolModal from '../UpdateSchoolModal';

const US_SCHOOL = {
  schoolName: 'Example Elementary School',
  schoolType: 'public',
  schoolId: '100000000001',
  schoolZip: '98101',
  country: 'US',
};

function renderModal(schoolInfo: typeof US_SCHOOL | null = US_SCHOOL) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag: 'teacher'});
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <ToastProvider politeness="polite">
        <UpdateSchoolModal open onClose={() => {}} schoolInfo={schoolInfo} />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const country = () => screen.getByRole('combobox', {name: /what country/i});
const zip = () => screen.getByRole('textbox', {name: /zip code/i});
const schoolList = () =>
  screen.getByRole('combobox', {name: 'Select your school from the list'});

beforeEach(() => vi.clearAllMocks());
afterEach(() => resetUsersFixtures());

describe('UpdateSchoolModal analytics', () => {
  it('reports the country the user selects', () => {
    renderModal(null);

    fireEvent.change(country(), {target: {value: 'US'}});

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('User Selects Country', {
      country: 'US',
    });
  });

  it('reports a five-digit zip with the current country', () => {
    renderModal();

    fireEvent.change(zip(), {target: {value: '98101'}});

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('Valid Zip Code Entered', {
      zip: '98101',
      country: 'US',
    });
  });

  it('reports nothing for a partial zip', () => {
    renderModal();

    fireEvent.change(zip(), {target: {value: '9810'}});

    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('reports the school picked from the list by its NCES id', async () => {
    renderModal();
    fireEvent.change(zip(), {target: {value: '98101'}});
    await waitFor(() =>
      expect(
        screen.getByRole('option', {name: 'Example Elementary School'}),
      ).toBeInTheDocument(),
    );
    vi.clearAllMocks();

    fireEvent.change(schoolList(), {target: {value: '100000000001'}});

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith('School Selected from Dropdown', {
      'nces Id': '100000000001',
      country: 'US',
    });
  });

  it('reports the choice to add the school manually', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', {name: /add manually/i}));

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(
      'User Elects to Add School Name Manually',
      {country: 'US'},
    );
  });
});
