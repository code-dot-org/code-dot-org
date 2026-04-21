import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import RegionalWorkshopCatalogCard from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalogCard';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockResolvedValue('authToken'),
}));

const TEST_SESSION_1 = {
  id: 1,
  start: '2025-04-22T13:00:00Z',
  end: '2025-04-22T21:00:00Z',
  is_local: false,
};

const TEST_SESSION_2 = {
  id: 2,
  start: '2025-05-01T08:00:00Z',
  end: '2025-05-01T11:00:00Z',
  is_local: false,
};

const DEFAULT_PROPS = {
  id: 1,
  course: 'Test Course 1',
  subject: 'Test Subject',
  name: 'National Test Workshop',
  capacity: 10,
  numEnrollments: 2,
  supportedGradeLevels: null,
  sessions: [TEST_SESSION_1],
  format: 'In-Person',
  locationName: 'Test University',
  fee: '$400',
  hasPrereq: true,
};

const renderDefault = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  render(<RegionalWorkshopCatalogCard {...props} />);
};

describe('RegionalWorkshopCatalog', () => {
  it('card states it is full and disables Learn More button if full', () => {
    renderDefault({capacity: 5, numEnrollments: 5});

    screen.getByText('Full');
    expect(screen.queryByRole('button', {name: 'learnMore'})).toBeDisabled();
  });

  it('card states how many spots are left and enables Learn More button if not full', () => {
    renderDefault();

    screen.getByText(
      `${DEFAULT_PROPS.capacity - DEFAULT_PROPS.numEnrollments} Seats Remaining`
    );
    expect(screen.getByRole('button', {name: 'learnMore'})).not.toBeDisabled();
  });

  it('card shows workshop name when available', () => {
    renderDefault();

    screen.getByText(DEFAULT_PROPS.name);
  });

  it('card shows workshop course and subject when name is not available', () => {
    renderDefault({name: ''});

    screen.getByText(`${DEFAULT_PROPS.course}: ${DEFAULT_PROPS.subject}`);
  });

  it('card does not list grade levels if workshop has null list of which grades it supports', () => {
    renderDefault();

    expect(screen.queryByText('FOR TEACHERS OF GRADES:')).toBe(null);
    expect(screen.queryByText('K')).toBe(null);
    expect(screen.queryByText('12')).toBe(null);
  });

  it('card does not list grade levels if workshop has empty list of which grades it supports', () => {
    renderDefault({supportedGradeLevels: []});

    expect(screen.queryByText('FOR TEACHERS OF GRADES:')).toBe(null);
    expect(screen.queryByText('K')).toBe(null);
    expect(screen.queryByText('12')).toBe(null);
  });

  it('card lists grade levels if workshop lists which grades it supports', () => {
    renderDefault({supportedGradeLevels: ['1', '2', '3']});

    screen.getByText('FOR TEACHERS OF GRADES:');
    screen.getByText('K');
    screen.getByText('12');
  });

  it('card lists start datetime of first session for workshop with one session', () => {
    renderDefault();

    screen.getByText('04/22/25 (1:00PM-9:00PM)');
  });

  it('card lists start datetime of first session and how many additional sessions there are for workshop with multiple sessions', () => {
    renderDefault({
      sessions: [TEST_SESSION_1, TEST_SESSION_2],
    });

    screen.getByText('04/22/25 (1:00PM-9:00PM) + 1 More');
  });
});
