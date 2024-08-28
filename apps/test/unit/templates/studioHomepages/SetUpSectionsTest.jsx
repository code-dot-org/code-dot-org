import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {UnconnectedSetUpSections as SetUpSections} from '@cdo/apps/templates/studioHomepages/SetUpSections';

describe('SetUpSections', () => {
  it('renders as expected', () => {
    render(
      <SetUpSections beginEditingSection={() => {}} asyncLoadComplete={true} />
    );

    screen.getByText('Add a new classroom section');
    screen.getByText(
      'Create a new classroom section to start assigning courses and seeing your student progress.'
    );
    screen.getByRole('button', {name: 'Create a section'});
  });

  it('calls beginEditingSection with no arguments when button is clicked', () => {
    const spy = jest.fn();
    render(
      <SetUpSections beginEditingSection={spy} asyncLoadComplete={true} />
    );
    expect(spy).not.toHaveBeenCalled();

    const button = screen.getByRole('button', {name: 'Create a section'});
    fireEvent.click(button);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]).toHaveLength(0);
  });

  it('sends start event when button is clicked', () => {
    render(
      <SetUpSections beginEditingSection={() => {}} asyncLoadComplete={true} />
    );
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    const button = screen.getByRole('button', {name: 'Create a section'});
    fireEvent.click(button);

    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    expect(analyticsSpy.mock.calls[0]).toEqual([
      'Section Setup Started',
      {},
      PLATFORMS.BOTH,
    ]);

    analyticsSpy.mockRestore();
  });

  it('has disabled button if asyncLoadComplete is false', () => {
    render(
      <SetUpSections beginEditingSection={() => {}} asyncLoadComplete={false} />
    );
    expect(
      screen.getByRole('button', {name: 'Create a section'})
    ).toBeDisabled();
  });
});
