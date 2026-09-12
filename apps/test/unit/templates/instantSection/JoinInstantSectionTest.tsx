import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import JoinInstantSection from '@cdo/apps/templates/instantSection/JoinInstantSection';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  ...jest.requireActual('@cdo/apps/util/HttpClient'),
  default: {fetchJson: jest.fn(), post: jest.fn()},
}));

describe('JoinInstantSection', () => {
  const originalLocation = window.location;
  const navigate = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...originalLocation, search: '', assign: navigate},
    });
    jest
      .mocked(HttpClient.fetchJson)
      .mockResolvedValue({value: {code: 'ABCDEF'}, response: {} as Response});
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  async function enterCode() {
    fireEvent.change(screen.getByRole('textbox', {name: i18n.sectionCode()}), {
      target: {value: 'abcdef'},
    });
    fireEvent.click(screen.getByRole('button', {name: i18n.continue()}));
    return await screen.findByRole('textbox', {
      name: i18n.instantSectionName(),
    });
  }

  it('checks the code, focuses the name field, and submits only a name with CSRF protection', async () => {
    jest
      .mocked(HttpClient.post)
      .mockResolvedValue({json: async () => ({redirect_url: '/'})} as Response);
    render(<JoinInstantSection />);
    const input = await enterCode();
    expect(HttpClient.fetchJson).toHaveBeenCalledWith(
      '/instant_sections/ABCDEF'
    );
    expect(input).toHaveFocus();
    fireEvent.change(input, {target: {value: ' Alex '}});
    fireEvent.click(screen.getByRole('button', {name: i18n.joinSection()}));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
    expect(HttpClient.post).toHaveBeenCalledWith(
      '/instant_sections/ABCDEF/join',
      JSON.stringify({name: 'Alex'}),
      true,
      {'Content-Type': 'application/json'}
    );
  });

  it('keeps invalid or ordinary section codes on the code step', async () => {
    jest
      .mocked(HttpClient.fetchJson)
      .mockRejectedValue(
        new NetworkError('Not found', {status: 404} as Response)
      );
    render(<JoinInstantSection />);
    fireEvent.change(screen.getByRole('textbox', {name: i18n.sectionCode()}), {
      target: {value: 'ABCDEF'},
    });
    fireEvent.click(screen.getByRole('button', {name: i18n.continue()}));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        i18n.instantSectionUnavailable()
      )
    );
    expect(
      screen.queryByRole('textbox', {name: i18n.instantSectionName()})
    ).not.toBeInTheDocument();
    expect(HttpClient.post).not.toHaveBeenCalled();
  });

  it('rechecks availability on enrollment and lets students change the code', async () => {
    jest
      .mocked(HttpClient.post)
      .mockRejectedValue(
        new NetworkError('Not found', {status: 404} as Response)
      );
    render(<JoinInstantSection />);
    const input = await enterCode();
    fireEvent.change(input, {target: {value: 'Alex'}});
    fireEvent.click(screen.getByRole('button', {name: i18n.joinSection()}));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        i18n.instantSectionUnavailable()
      )
    );
    expect(screen.getByRole('textbox', {name: i18n.sectionCode()})).toHaveValue(
      'ABCDEF'
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not submit a blank name', async () => {
    render(<JoinInstantSection />);
    const input = await enterCode();
    fireEvent.change(input, {target: {value: '   '}});
    expect(
      screen.getByRole('button', {name: i18n.joinSection()})
    ).toBeDisabled();
    expect(HttpClient.post).not.toHaveBeenCalled();
  });

  it('preserves the code in a direct join link without creating an account', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...originalLocation, search: '?return_to=%2Fjoin%2FABCDEF'},
    });
    render(<JoinInstantSection />);
    expect(screen.getByRole('textbox', {name: i18n.sectionCode()})).toHaveValue(
      'ABCDEF'
    );
    expect(HttpClient.post).not.toHaveBeenCalled();
  });
});
