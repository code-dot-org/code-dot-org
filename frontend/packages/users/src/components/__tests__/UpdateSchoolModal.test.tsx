import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {ToastProvider} from '@code-dot-org/component-library/toast';
import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../../fixtures';
import UpdateSchoolModal from '../UpdateSchoolModal';

const SCHOOL = {
  schoolName: 'Example Elementary School',
  schoolType: 'public',
  schoolId: '100000000001',
  schoolZip: '98101',
  country: 'US',
};

function renderModal(schoolInfo: typeof SCHOOL | null = null) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag: 'teacher'});
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={createQueryClient({queries: {retry: false}})}>
      <ToastProvider politeness="polite">
        <UpdateSchoolModal open onClose={onClose} schoolInfo={schoolInfo} />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return onClose;
}

const country = () => screen.getByRole('combobox', {name: /what country/i});
const zip = () => screen.getByRole('textbox', {name: /zip code/i});
const schoolList = () =>
  screen.getByRole('combobox', {name: 'Select your school from the list'});
const submit = () => screen.getByRole('button', {name: 'Update my school'});

afterEach(() => resetUsersFixtures());

describe('UpdateSchoolModal', () => {
  it('describes itself with the title and intro', () => {
    renderModal();
    const dialog = screen.getByRole('dialog', {
      name: 'Update your school information',
    });
    expect(dialog).toHaveAccessibleDescription(/Find your new school/);
  });

  it('saves a US school picked from the zip search', async () => {
    const onClose = renderModal();

    fireEvent.change(country(), {target: {value: 'US'}});
    fireEvent.change(zip(), {target: {value: '98101'}});

    await waitFor(() =>
      expect(
        screen.getByRole('option', {name: 'Example Elementary School'}),
      ).toBeInTheDocument(),
    );
    expect(submit()).toBeDisabled();

    fireEvent.change(schoolList(), {target: {value: '100000000001'}});
    expect(submit()).toBeEnabled();

    fireEvent.click(submit());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('switches to a typed school name when the school is not listed', async () => {
    const onClose = renderModal(SCHOOL);

    fireEvent.change(zip(), {target: {value: '98101'}});
    await waitFor(() =>
      expect(
        screen.getByRole('option', {name: 'Example Middle School'}),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', {name: /add manually/i}));

    expect(
      screen.queryByRole('combobox', {
        name: 'Select your school from the list',
      }),
    ).toBeNull();
    const name = screen.getByRole('textbox', {name: /school\/organization/i});
    expect(submit()).toBeDisabled();

    fireEvent.change(name, {target: {value: 'Peachtree Academy'}});
    expect(submit()).toBeEnabled();

    fireEvent.click(submit());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('asks only for a school name outside the US', async () => {
    const onClose = renderModal();

    fireEvent.change(country(), {target: {value: 'CA'}});

    expect(screen.queryByRole('textbox', {name: /zip code/i})).toBeNull();
    expect(
      screen.queryByRole('combobox', {
        name: 'Select your school from the list',
      }),
    ).toBeNull();
    expect(submit()).toBeDisabled();

    fireEvent.change(
      screen.getByRole('textbox', {name: /school\/organization/i}),
      {target: {value: 'École Secondaire'}},
    );
    expect(submit()).toBeEnabled();

    fireEvent.click(submit());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('keeps the save disabled until the inputs form a valid school', () => {
    renderModal();

    expect(submit()).toBeDisabled();

    fireEvent.change(country(), {target: {value: 'US'}});
    expect(submit()).toBeDisabled();

    fireEvent.change(zip(), {target: {value: '303'}});
    expect(submit()).toBeDisabled();

    fireEvent.change(zip(), {target: {value: '98101'}});
    expect(submit()).toBeDisabled();
  });

  it('reports a valid zip with no schools', async () => {
    renderModal();

    fireEvent.change(country(), {target: {value: 'US'}});
    fireEvent.change(zip(), {target: {value: '30305'}});

    expect(
      await screen.findByText('No schools found for that zip code.'),
    ).toBeInTheDocument();
    expect(submit()).toBeDisabled();
  });

  it('stays open with the server error when the save is rejected', async () => {
    const onClose = renderModal(SCHOOL);
    mockServer.use(
      http.patch(
        '*/api/v1/user_school_infos',
        () =>
          new HttpResponse(
            JSON.stringify({error: 'school id or country is not present'}),
            {status: 422, headers: {'content-type': 'application/json'}},
          ),
      ),
    );

    fireEvent.change(zip(), {target: {value: '98101'}});
    await waitFor(() =>
      expect(
        screen.getByRole('option', {name: 'Example Middle School'}),
      ).toBeInTheDocument(),
    );
    fireEvent.change(schoolList(), {target: {value: '100000000002'}});
    fireEvent.click(submit());

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('discards edits on cancel', () => {
    const onClose = renderModal();

    fireEvent.change(country(), {target: {value: 'CA'}});
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(onClose).toHaveBeenCalled();
  });
});
