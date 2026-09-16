import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import BadgeScanner from '@cdo/apps/templates/badges/BadgeScanner';
import {createDecoder} from '@cdo/apps/templates/badges/decoder';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/templates/badges/decoder');
jest.mock('@cdo/apps/util/HttpClient');
jest.mock('@cdo/apps/code-studio/clientState', () => ({reset: jest.fn()}));

const strings = Object.fromEntries(
  [
    'start',
    'cancel',
    'switch_camera',
    'other_login',
    'instruction',
    'waiting',
    'scanning',
    'signing_in',
    'camera_denied',
    'camera_unsupported',
    'network_error',
  ].map(key => [key, key])
);
let stop;
let getUserMedia;

beforeEach(() => {
  stop = jest.fn();
  getUserMedia = jest.fn().mockResolvedValue({getTracks: () => [{stop}]});
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {getUserMedia},
  });
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  createDecoder.mockResolvedValue(jest.fn().mockResolvedValue(undefined));
});

afterEach(() => jest.restoreAllMocks());

it('waits for a user action and stops camera tracks on cancel', async () => {
  render(<BadgeScanner strings={strings} />);
  expect(getUserMedia).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', {name: 'start'}));
  await screen.findByText('scanning');
  expect(getUserMedia).toHaveBeenCalledWith({
    video: {facingMode: {ideal: 'user'}},
    audio: false,
  });
  fireEvent.click(screen.getByRole('button', {name: 'cancel'}));
  expect(stop).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', {name: 'start'})).toHaveFocus();
});

it('discards a late camera permission result after cancellation', async () => {
  let resolve;
  getUserMedia.mockReturnValue(
    new Promise(done => {
      resolve = done;
    })
  );
  render(<BadgeScanner strings={strings} />);
  fireEvent.click(screen.getByRole('button', {name: 'start'}));
  expect(screen.getByText('waiting')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'cancel'}));
  await act(async () => resolve({getTracks: () => [{stop}]}));
  expect(stop).toHaveBeenCalledTimes(1);
  expect(createDecoder).not.toHaveBeenCalled();
});

it('stops on unmount and acquires the selected rear camera', async () => {
  const {unmount} = render(<BadgeScanner strings={strings} />);
  fireEvent.click(screen.getByRole('button', {name: 'start'}));
  await screen.findByText('scanning');
  fireEvent.click(screen.getByRole('button', {name: 'switch_camera'}));
  await screen.findByText('scanning');
  expect(getUserMedia).toHaveBeenLastCalledWith({
    video: {facingMode: {ideal: 'environment'}},
    audio: false,
  });
  unmount();
  expect(stop).toHaveBeenCalledTimes(2);
});

it('shows a useful permission error and an existing-login fallback', async () => {
  getUserMedia.mockRejectedValue({name: 'NotAllowedError'});
  render(<BadgeScanner strings={strings} />);
  fireEvent.click(screen.getByRole('button', {name: 'start'}));
  await screen.findByText('camera_denied');
  expect(screen.getByRole('link', {name: 'other_login'})).toHaveAttribute(
    'href',
    '/users/sign_in'
  );
});

it('submits once and closes the camera before waiting for authentication', async () => {
  const payload = `CDO1.${'a'.repeat(32)}.1.${'b'.repeat(43)}`;
  createDecoder.mockResolvedValue(jest.fn().mockResolvedValue(payload));
  HttpClient.post.mockReturnValue(new Promise(() => {}));
  const {unmount} = render(<BadgeScanner strings={strings} />);
  fireEvent.click(screen.getByRole('button', {name: 'start'}));
  await waitFor(() => expect(HttpClient.post).toHaveBeenCalledTimes(1));
  expect(stop).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', {name: 'cancel'})).toBeDisabled();
  unmount();
});
