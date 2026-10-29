import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import localization from '@cdo/apps/localization';
import I18nDropdown from '@cdo/apps/sharedComponents/footer/I18nDropdown';

const OPTIONS = [
  {value: 'en-US', text: 'English'},
  {value: 'es-MX', text: 'Español (LATAM)'},
];

describe('I18nDropdown', () => {
  let submit: jest.SpyInstance;
  let setLocale: jest.SpyInstance;

  beforeEach(() => {
    // jsdom does not implement form submission
    submit = jest
      .spyOn(HTMLFormElement.prototype, 'submit')
      .mockImplementation(() => {});
    setLocale = jest
      .spyOn(localization, 'locale', 'set')
      .mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  function renderDropdown() {
    render(
      <I18nDropdown localeUrl="/locale" selected="en-US" options={OPTIONS} />
    );
    return screen.getByRole('combobox');
  }

  it('renders the given options with the selected locale', () => {
    const select = renderDropdown();
    expect(select).toHaveValue('en-US');
    expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
  });

  it('submits the locale form when LocalizeJS is not active', () => {
    jest.spyOn(localization, 'isLocalizeJS').mockReturnValue(false);
    fireEvent.change(renderDropdown(), {target: {value: 'es-MX'}});

    expect(submit).toHaveBeenCalledTimes(1);
    expect(setLocale).not.toHaveBeenCalled();
  });

  it('sets the locale through localization when LocalizeJS is active', () => {
    jest.spyOn(localization, 'isLocalizeJS').mockReturnValue(true);
    fireEvent.change(renderDropdown(), {target: {value: 'es-MX'}});

    expect(setLocale).toHaveBeenCalledWith('es-MX');
    expect(submit).not.toHaveBeenCalled();
  });
});
