import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {CongratsStep as CongratsStepContent} from '@cdo/apps/adaptive/types';
import CongratsStep from '@cdo/apps/adaptive/views/steps/CongratsStep';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

jest.mock('@cdo/apps/util/copyToClipboard', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// The panel reads the viewer's role from the store and the share URL from
// the pathway's own project manager.
let mockState: {currentUser: {userType: string}} = {
  currentUser: {userType: 'student'},
};
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (select: (state: unknown) => unknown) => select(mockState),
}));
let mockShareUrl: string | null =
  'https://studio.code.org/projects/weblab2/abc123';
jest.mock('@cdo/apps/adaptive/project/usePathwayProject', () => ({
  usePathwayProject: () => ({
    projectManager: {getShareUrl: () => mockShareUrl},
  }),
}));
jest.mock('@cdo/apps/adaptive/views/PathwayContext', () => ({
  usePathwayContext: () => ({pathway: {}}),
}));

const step: CongratsStepContent = {
  id: 'wrap-up-congrats',
  title: 'You just built something with AI!',
  kind: 'congrats',
  panelId: 'hoai2026',
  logoUrl: 'https://images.code.org/logo.png',
};

describe('CongratsStep', () => {
  afterEach(() => {
    mockState = {currentUser: {userType: 'student'}};
    mockShareUrl = 'https://studio.code.org/projects/weblab2/abc123';
  });

  it("shows the card, copies the project's link, and ends on the certificate", () => {
    const onComplete = jest.fn();
    render(<CongratsStep step={step} onComplete={onComplete} />);
    expect(
      screen.getByRole('heading', {name: 'You just built something with AI!'})
    ).toBeTruthy();
    expect(
      screen.getByText(/Join the Building with AI Challenge/)
    ).toBeTruthy();
    expect(document.querySelector('img')?.getAttribute('src')).toBe(
      'https://images.code.org/logo.png'
    );
    expect(
      screen
        .getByRole('link', {name: /Learn about the Building with AI Challenge/})
        .getAttribute('target')
    ).toBe('_blank');

    fireEvent.click(screen.getByRole('button', {name: /Copy link/}));
    expect(copyToClipboard).toHaveBeenCalledWith(
      'https://studio.code.org/projects/weblab2/abc123',
      expect.any(Function),
      expect.any(Function)
    );

    expect(screen.queryByText('Elevate your Hour of AI')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Certificate'}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('adds the professional learning cards for a teacher', () => {
    mockState = {...mockState, currentUser: {userType: 'teacher'}};
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(screen.getByText('Elevate your Hour of AI')).toBeTruthy();
    expect(screen.getByText('AI Foundations')).toBeTruthy();
    expect(screen.getAllByRole('link', {name: /Learn more/})).toHaveLength(2);
  });

  it('leaves out the share card when no project channel is loaded', () => {
    mockShareUrl = null;
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(screen.queryByText('Share your site')).toBeNull();
    expect(screen.getByText('Get your certificate')).toBeTruthy();
  });
});
