import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import fileDownload from 'js-file-download';
import React from 'react';

import {CongratsStep as CongratsStepContent} from '@cdo/apps/adaptive/types';
import CongratsStep from '@cdo/apps/adaptive/views/steps/CongratsStep';
import DCDO from '@cdo/apps/dcdo';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

jest.mock('js-file-download', () => jest.fn());
const mockBuildProjectZip = jest.fn();
jest.mock('@cdo/apps/adaptive/project/exportProjectZip', () => ({
  ...jest.requireActual('@cdo/apps/adaptive/project/exportProjectZip'),
  buildProjectZip: (...args: unknown[]) => mockBuildProjectZip(...args),
}));
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
const multiFileSource = {
  folders: {},
  files: {'1': {id: '1', name: 'index.html', contents: '', folderId: '0'}},
};
let mockSource: unknown = multiFileSource;
jest.mock('@cdo/apps/adaptive/project/usePathwayProject', () => ({
  usePathwayProject: () => ({
    projectManager: {getShareUrl: () => mockShareUrl},
    sources: {source: mockSource},
    channel: {name: 'My Site'},
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
    mockSource = multiFileSource;
    mockBuildProjectZip.mockReset();
    jest.mocked(fileDownload).mockReset();
    DCDO.reset();
  });

  it("shows the card, copies the project's link, and ends on the certificate", () => {
    const onComplete = jest.fn();
    render(<CongratsStep step={step} onComplete={onComplete} />);
    expect(
      screen.getByRole('heading', {name: 'You just built something with AI!'})
    ).toBeTruthy();
    expect(document.querySelector('img')?.getAttribute('src')).toBe(
      'https://images.code.org/logo.png'
    );

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

  it('leaves out the challenge when adaptive-challenge-url is unset', () => {
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(
      screen.getByText(/Keep exploring and building with AI/)
    ).toBeTruthy();
    expect(screen.queryByText(/Challenge/)).toBeNull();
  });

  it('ignores a adaptive-challenge-url that is not a string', () => {
    DCDO.set('adaptive-challenge-url', true);
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(screen.queryByText(/Challenge/)).toBeNull();
  });

  it('links to the challenge when adaptive-challenge-url is set', () => {
    DCDO.set('adaptive-challenge-url', 'https://example.com/challenge');
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(
      screen.getByText(/Join the Building with AI Challenge/)
    ).toBeTruthy();
    const link = screen.getByRole('link', {
      name: /Learn about the Building with AI Challenge/,
    });
    expect(link.getAttribute('href')).toBe('https://example.com/challenge');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('takes the challenge copy from DCDO when set', () => {
    DCDO.set('adaptive-challenge-url', 'https://example.com/challenge');
    DCDO.set('adaptive-challenge-description', 'Join the Spring Challenge.');
    DCDO.set('adaptive-challenge-button-text', 'See the Spring Challenge');
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(screen.getByText('Join the Spring Challenge.')).toBeTruthy();
    expect(
      screen.getByRole('link', {name: /See the Spring Challenge/})
    ).toBeTruthy();
  });

  it('keeps the default challenge copy when the DCDO copy is null', () => {
    DCDO.set('adaptive-challenge-url', 'https://example.com/challenge');
    DCDO.set('adaptive-challenge-description', null);
    DCDO.set('adaptive-challenge-button-text', null);
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(
      screen.getByText(/Join the Building with AI Challenge/)
    ).toBeTruthy();
    expect(
      screen.getByRole('link', {
        name: /Learn about the Building with AI Challenge/,
      })
    ).toBeTruthy();
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

  it("downloads the student's code as a zip named for the project", async () => {
    const zip = new Blob(['zip']);
    mockBuildProjectZip.mockResolvedValue(zip);
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: 'Export my code'}));
    await waitFor(() =>
      expect(fileDownload).toHaveBeenCalledWith(zip, 'My Site.zip')
    );
    expect(mockBuildProjectZip).toHaveBeenCalledWith(
      multiFileSource,
      'My Site'
    );
    expect(screen.queryByText(/could not be exported/)).toBeNull();
  });

  it('says so when the export fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockBuildProjectZip.mockRejectedValue(new Error('fetch failed'));
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', {name: 'Export my code'}));
    expect(
      (await screen.findByText(/could not be exported/)).getAttribute('role')
    ).toBe('alert');
    expect(fileDownload).not.toHaveBeenCalled();
    jest.mocked(console.error).mockRestore();
  });

  it('leaves out the export card for a teacher', () => {
    mockState = {...mockState, currentUser: {userType: 'teacher'}};
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(screen.queryByText('Export your code')).toBeNull();
  });

  it('leaves out the export card until the sources have loaded', () => {
    mockSource = undefined;
    render(<CongratsStep step={step} onComplete={jest.fn()} />);
    expect(screen.queryByText('Export your code')).toBeNull();
  });
});
