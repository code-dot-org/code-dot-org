import {fireEvent, render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import Hoai2026Congrats from '@cdo/apps/lab2/views/dialogs/finishDialogs/Hoai2026Congrats';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));
jest.mock('@cdo/apps/util/copyToClipboard', () => jest.fn());
jest.mock('@cdo/apps/util/trackEvent', () => jest.fn());

const sendEvent = analyticsReporter.sendEvent as jest.Mock;
const reportedActions = () =>
  sendEvent.mock.calls.map(([name, payload, withProject]) => {
    expect(name).toBe(EVENTS.HOAI2026_FINISH_DIALOG);
    expect(withProject).toBe(true);
    return payload.action;
  });

describe('Hoai2026Congrats', () => {
  beforeEach(() => sendEvent.mockClear());

  const renderDialog = (
    props: Partial<React.ComponentProps<typeof Hoai2026Congrats>> = {}
  ) =>
    render(
      <Hoai2026Congrats
        onClose={jest.fn()}
        shareUrl="https://studio.code.org/projects/spritelab2/abc"
        projectType="spritelab"
        onRemix={jest.fn()}
        certificateUrl="/congrats?s=hoai2026-dev"
        {...props}
      />
    );

  it('offers the next steps for students and teachers', () => {
    renderDialog();
    expect(
      screen.getByRole('dialog', {name: 'Congratulations!'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Discover more in Quest Builder',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: 'Bring AI to your classroom'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /How AI Makes Decisions/})
    ).toHaveAttribute(
      'href',
      'https://studio.code.org/courses/k5-ai-data-2024/units/1/reset'
    );
    expect(screen.getByRole('link', {name: /AI Discoveries/})).toHaveAttribute(
      'href',
      'https://code.org/en-US/curriculum/artificial-intelligence-discoveries'
    );
    expect(screen.getByRole('button', {name: 'Copy link'})).toBeInTheDocument();
    const certificate = screen.getByRole('link', {name: 'Certificate'});
    expect(certificate).toHaveAttribute('href', '/congrats?s=hoai2026-dev');
    // In place of the lab, as the lab's Finish would go.
    expect(certificate).not.toHaveAttribute('target');
    const elevate = screen.getByRole('region', {
      name: 'Elevate your Hour of AI',
    });
    expect(
      within(elevate).getByText('Prepare to lead an Hour of AI.')
    ).toBeInTheDocument();
    const learnMore = within(elevate).getByRole('link', {name: 'Learn more'});
    expect(learnMore).toHaveAttribute('href', 'https://aka.ms/ElevateHourofAI');
    expect(learnMore).toHaveAttribute('target', '_blank');
  });

  it('shows a picture on the students card, with no name to read out', () => {
    renderDialog();
    const students = screen.getByRole('region', {
      name: 'Discover more in Quest Builder',
    });
    expect(within(students).getByAltText('')).toBeInTheDocument();
  });

  it('opens a remix of the game from the student card', () => {
    const onRemix = jest.fn();
    renderDialog({onRemix});
    fireEvent.click(screen.getByRole('button', {name: 'Remix your project'}));
    expect(onRemix).toHaveBeenCalledTimes(1);
  });

  it('holds the certificate when the unit has no finish URL', () => {
    renderDialog({certificateUrl: undefined});
    expect(screen.queryByRole('link', {name: 'Certificate'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Certificate'})).toBeDisabled();
  });

  it('holds Remix your project when the project may not be remixed', () => {
    renderDialog({onRemix: undefined});
    expect(
      screen.getByRole('button', {name: 'Remix your project'})
    ).toBeDisabled();
  });

  it('names each offer by its heading once', () => {
    renderDialog();
    const offer = screen.getByRole('region', {name: 'Share your game'});
    expect(offer.getAttribute('aria-labelledby')).toBe(
      offer.querySelector('h4')?.id
    );
  });

  it('says so instead of offering a link when the game cannot be shared', () => {
    renderDialog({shareUrl: undefined});
    expect(screen.queryByRole('button', {name: 'Copy link'})).toBeNull();
    expect(
      screen.getByText("This game can't be shared right now.")
    ).toBeInTheDocument();
  });

  it('closes on Keep playing', () => {
    const onClose = jest.fn();
    renderDialog({onClose});
    screen.getByRole('button', {name: 'Keep playing'}).click();
    expect(onClose).toHaveBeenCalled();
  });

  it('reports that it was shown, once', () => {
    const view = renderDialog();
    view.rerender(
      <Hoai2026Congrats
        onClose={jest.fn()}
        shareUrl="https://studio.code.org/projects/spritelab2/abc"
        projectType="spritelab"
      />
    );
    expect(reportedActions()).toEqual(['shown']);
  });

  it('reports each call to action as it is pressed', () => {
    renderDialog();
    sendEvent.mockClear();
    const press = (role: 'button' | 'link', name: RegExp | string) =>
      fireEvent.click(screen.getByRole(role, {name}));
    press('button', 'Remix your project');
    press('link', /How AI Makes Decisions/);
    press('link', /AI Discoveries/);
    press('button', 'Copy link');
    press('link', 'Certificate');
    press('link', 'Learn more');
    press('button', 'Keep playing');
    press('button', 'Close');
    expect(reportedActions()).toEqual([
      'open_quest_builder_standalone',
      'elementary',
      'middle_school',
      'copy_link',
      'certificate',
      'elevate_hour_of_ai',
      'keep_playing',
      'close',
    ]);
  });
});
