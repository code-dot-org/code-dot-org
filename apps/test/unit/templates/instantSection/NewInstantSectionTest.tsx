import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import NewInstantSection from '@cdo/apps/templates/instantSection/NewInstantSection';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/HttpClient');

describe('NewInstantSection', () => {
  function renderComponent() {
    registerReducers({teacherSections});
    const store = getStore();
    render(
      <Provider store={store}>
        <NewInstantSection />
      </Provider>
    );
    return store;
  }

  it('creates a section, adds it to the dashboard, and displays its code', async () => {
    jest.mocked(HttpClient.post).mockResolvedValue({
      json: async () => ({
        id: 123,
        name: "Teacher's Instant Section",
        code: 'ABCDEF',
        participant_type: 'student',
        login_type: 'word',
        instant_section: true,
      }),
    } as Response);
    const store = renderComponent();
    const trigger = screen.getByRole('button', {
      name: i18n.instantSectionNew(),
    });
    trigger.focus();
    fireEvent.click(trigger);

    expect(
      await screen.findByRole('dialog', {name: i18n.instantSectionTitle()})
    ).toBeInTheDocument();
    expect(screen.getByText('ABCDEF')).toBeInTheDocument();
    expect(screen.getByText('code.org/join')).toBeInTheDocument();
    expect(HttpClient.post).toHaveBeenCalledWith(
      '/api/v1/sections/instant',
      undefined,
      true
    );
    expect(store.getState().teacherSections.sections[123].code).toBe('ABCDEF');
    expect(
      store.getState().teacherSections.sections[123].isInstantSection
    ).toBe(true);

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('blocks repeated clicks while creation is pending and allows retry after failure', async () => {
    let rejectRequest: (error: Error) => void = () => {};
    jest.mocked(HttpClient.post).mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectRequest = reject;
      })
    );
    renderComponent();
    const trigger = screen.getByRole('button', {
      name: i18n.instantSectionNew(),
    });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(HttpClient.post).toHaveBeenCalledTimes(1);
    expect(trigger).toBeDisabled();

    rejectRequest(new Error('network failure'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      i18n.instantSectionCreateError()
    );
    await waitFor(() => expect(trigger).toBeEnabled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
