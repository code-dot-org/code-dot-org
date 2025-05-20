import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import TurnOffAiDiff from '@cdo/apps/accounts/TurnOffAiDiff';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setAiDifferentiationEnabled,
} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

describe('TurnOffAiDiff', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({currentUser});
    store = getStore();
    store.dispatch(setAiDifferentiationEnabled(true));
  });

  afterEach(() => {
    restoreRedux();
    jest.restoreAllMocks();
  });

  it('renders correctly with initial state', () => {
    store.dispatch(setAiDifferentiationEnabled(true));
    render(
      <Provider store={store}>
        <TurnOffAiDiff />
      </Provider>
    );

    screen.getByText('AI Teaching Assistant Chat Settings');
    screen.getByLabelText(
      i18n.aiTeachingAssistantSettingsStatus({status: 'enabled'})
    );
    const toggle = screen.getByRole('checkbox', {
      name: 'Chat functionality for AI Teaching Assistant Chat is enabled',
    });
    expect(toggle).toBeChecked();
  });

  it('toggles the setting when clicked', () => {
    store.dispatch(setAiDifferentiationEnabled(true));

    render(
      <Provider store={store}>
        <TurnOffAiDiff />
      </Provider>
    );

    const setStub = jest.spyOn(
      UserPreferences.prototype,
      'setAiDifferentiationEnabled'
    );

    const toggle = screen.getByRole('checkbox', {
      name: i18n.aiTeachingAssistantSettingsStatus({status: 'enabled'}),
    });
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);

    expect(toggle).not.toBeChecked();
    screen.getByRole('checkbox', {
      name: i18n.aiTeachingAssistantSettingsStatus({status: 'disabled'}),
    });
    expect(setStub).toHaveBeenCalledWith(false);
  });
});
