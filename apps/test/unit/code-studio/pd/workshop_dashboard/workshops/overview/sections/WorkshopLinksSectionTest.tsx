import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import {WorkshopLinksSection} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/overview/sections/WorkshopLinksSection';
import {WorkshopData} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn();
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('WorkshopLinksSection', () => {
  const createTestWorkshop = (
    overrides: Partial<WorkshopData> = {}
  ): WorkshopData => ({
    id: 1,
    state: 'Not Started',
    timeZone: 'America/Denver',
    name: 'Test Workshop',
    course: 'Build Your Own Workshop',
    subject: null,
    courseOfferingNames: 'AI something or other',
    sessions: [
      {
        id: 1,
        start: '2024-07-01T15:00:00.000Z',
        end: '2024-07-01T23:00:00.000Z',
        sessionFormat: 'in_person',
        locationName: 'Test Location',
        code: 'TEST',
        showLink: false,
        attendanceCount: 0,
        locationAddress: null,
        meetingLink: null,
      },
    ],
    facilitators: [],
    regionalPartnerName: 'Test Regional Partner',
    accountRequiredForAttendance: false,
    readyToClose: false,
    registrationLink: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    enrolledTeacherCount: 1,
    hidden: false,
    ...overrides,
  });

  const renderDefault = (workshop: WorkshopData) => {
    return render(
      <MemoryRouter>
        <WorkshopLinksSection workshop={workshop} />
      </MemoryRouter>
    );
  };

  it('renders only single column if workshop does not have custom registration link', () => {
    renderDefault(createTestWorkshop());

    screen.getByText('Your Workshop Links');
    screen.getByText('Marketing Page');
    screen.getByText(
      `${window.location.origin}/professional-learning/workshops/1`
    );
    expect(screen.getAllByText('Copy link').length).toBe(1);
  });

  it('renders both columns if workshop has custom registration link', () => {
    renderDefault(
      createTestWorkshop({registrationLink: 'http://custom/reg/link'})
    );

    screen.getByText('Your Workshop Links');
    screen.getByText('Marketing Page');
    screen.getByText('Join Workshop Page');
    screen.getByText(
      `${window.location.origin}/professional-learning/workshops/1`
    );
    screen.getByText(`${window.location.origin}/pd/workshops/1/join`);
    expect(screen.getAllByText('Copy link').length).toBe(2);
  });

  it('shows "Visible in catalog" with eye icon when workshop is not hidden', () => {
    renderDefault(createTestWorkshop({hidden: false}));

    const visibilityTag = screen.getByText('Visible in catalog');
    expect(visibilityTag).toBeInTheDocument();
  });

  it('shows "Hidden from catalog" with eye-slash icon when workshop is hidden', () => {
    renderDefault(createTestWorkshop({hidden: true}));

    const visibilityTag = screen.getByText('Hidden from catalog');
    expect(visibilityTag).toBeInTheDocument();
  });
});
