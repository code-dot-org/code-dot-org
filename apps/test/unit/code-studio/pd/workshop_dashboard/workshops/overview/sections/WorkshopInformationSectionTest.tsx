import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';

import {WorkshopInformationSection} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/overview/sections/WorkshopInformationSection';
import {WorkshopData} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => true));

describe('WorkshopInformationSection', () => {
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
    facilitators: [
      {
        id: 1,
        name: 'Test Facilitator',
        email: 'facilitator@test.com',
      },
    ],
    regionalPartnerName: 'Test Regional Partner',
    accountRequiredForAttendance: false,
    readyToClose: false,
    registrationLink: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    enrolledTeacherCount: 1,
    hidden: false,
    ...overrides,
  });

  const renderWorkshopInformationSection = (
    workshop: WorkshopData,
    isWorkshopAdmin = false
  ) => {
    return render(
      <MemoryRouter>
        <WorkshopInformationSection
          workshop={workshop}
          isWorkshopAdmin={isWorkshopAdmin}
        />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('shows an edit button when the workshop is in "Not Started" state', () => {
    const workshop = createTestWorkshop({state: 'Not Started'});
    renderWorkshopInformationSection(workshop);

    const editButton = screen.getByRole('button', {name: /edit/i});
    expect(editButton).toBeInTheDocument();
  });

  it('does not show an edit button when the workshop course config is not found', () => {
    const workshop = createTestWorkshop({course: 'Not in config'});
    renderWorkshopInformationSection(workshop);

    const editButton = screen.queryByRole('button', {name: /edit/i});
    expect(editButton).not.toBeInTheDocument();
  });

  it('does not show an edit button when the workshop is not in "Not Started" state', () => {
    const states: Array<WorkshopData['state']> = ['In Progress', 'Ended'];

    states.forEach(state => {
      const workshop = createTestWorkshop({state});
      const {unmount} = renderWorkshopInformationSection(workshop);

      const editButton = screen.queryByRole('button', {name: /edit/i});
      expect(editButton).not.toBeInTheDocument();

      unmount();
    });
  });

  it('Admin has an edit button in all workshop states', () => {
    const states: Array<WorkshopData['state']> = [
      'Not Started',
      'In Progress',
      'Ended',
    ];

    states.forEach(state => {
      const workshop = createTestWorkshop({state});
      const {unmount} = renderWorkshopInformationSection(workshop, true);

      const editButton = screen.getByRole('button', {name: /edit \(admin\)/i});
      expect(editButton).toBeInTheDocument();

      unmount();
    });
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    const workshop = createTestWorkshop({state: 'Not Started'});
    renderWorkshopInformationSection(workshop);

    const editButton = screen.getByRole('button', {name: /edit/i});
    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('edit');
  });

  it('shows "Edit (admin)" text for admin users', () => {
    const workshop = createTestWorkshop({state: 'In Progress'});
    renderWorkshopInformationSection(workshop, true);

    const editButton = screen.getByRole('button', {name: /edit \(admin\)/i});
    expect(editButton).toBeInTheDocument();
  });

  it('shows regular "Edit" text for non-admin users', () => {
    const workshop = createTestWorkshop({state: 'Not Started'});
    renderWorkshopInformationSection(workshop, false);

    const editButton = screen.getByRole('button', {name: /^edit$/i});
    expect(editButton).toBeInTheDocument();
  });

  it('displays workshop information correctly', () => {
    const workshop = createTestWorkshop({
      name: 'Custom Workshop Name',
      subject: 'Test Subject',
      courseOfferingNames: 'Course 1, Course 2',
      facilitators: [
        {id: 1, name: 'John Doe', email: 'john@test.com'},
        {id: 2, name: 'Jane Smith', email: 'jane@test.com'},
      ],
      regionalPartnerName: 'Test Regional Partner',
    });
    renderWorkshopInformationSection(workshop);

    // Check workshop name
    expect(screen.getByText('Custom Workshop Name')).toBeInTheDocument();

    // Check subject
    expect(screen.getByText('Test Subject')).toBeInTheDocument();

    // Check course offerings
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Course 2')).toBeInTheDocument();

    // Check facilitators
    expect(screen.getByText('John Doe, john@test.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith, jane@test.com')).toBeInTheDocument();

    // Check regional partner
    expect(screen.getByText('Test Regional Partner')).toBeInTheDocument();
  });

  it('displays session information correctly', () => {
    const workshop = createTestWorkshop({
      sessions: [
        {
          id: 1,
          start: '2024-07-01T15:00:00.000Z',
          end: '2024-07-01T23:00:00.000Z',
          sessionFormat: 'in_person',
          locationName: 'Physical Location',
          code: 'TEST1',
          showLink: false,
          attendanceCount: 0,
          locationAddress: null,
          meetingLink: null,
        },
        {
          id: 2,
          start: '2024-07-02T15:00:00.000Z',
          end: '2024-07-02T23:00:00.000Z',
          sessionFormat: 'virtual',
          locationName: null,
          code: 'TEST2',
          showLink: false,
          attendanceCount: 0,
          locationAddress: null,
          meetingLink: null,
        },
      ],
    });
    renderWorkshopInformationSection(workshop);

    // Check that session dates are displayed
    expect(screen.getByText('07/01/2024')).toBeInTheDocument();
    expect(screen.getByText('07/02/2024')).toBeInTheDocument();

    // Check location information
    expect(screen.getByText('Physical Location')).toBeInTheDocument();
    expect(screen.getByText('Virtual')).toBeInTheDocument();
  });

  it('displays "N/A" when facilitators are not provided', () => {
    const workshop = createTestWorkshop({
      facilitators: [],
    });
    renderWorkshopInformationSection(workshop);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays "N/A" when regional partner is not provided', () => {
    const workshop = createTestWorkshop({
      regionalPartnerName: null,
    });
    renderWorkshopInformationSection(workshop);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('falls back to course name when workshop name is not provided', () => {
    const workshop = createTestWorkshop({
      name: null,
      course: 'CS Discoveries',
    });
    renderWorkshopInformationSection(workshop);

    expect(screen.getByText('CS Discoveries')).toBeInTheDocument();
  });
});
