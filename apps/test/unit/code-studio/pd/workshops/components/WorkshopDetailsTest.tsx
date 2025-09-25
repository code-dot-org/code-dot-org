import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {SessionFormat} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/types';
import WorkshopDetails from '@cdo/apps/code-studio/pd/workshops/components/WorkshopDetails';

const baseProps = {
  name: 'Cybersecurity Basics Workshop',
  gradeLevels: ['K', '1', '2'],
  sessions: [
    {
      id: 1,
      start: '2025-05-22T07:00:00.000Z',
      end: '2025-05-22T19:00:00.000Z',
      is_local: true,
      location_name: 'Kyiv, Intercontinental Hotel',
      location_address: '',
      meeting_link: '',
      session_format: 'in_person' as SessionFormat,
    },
  ],
  fee: '0',
  prereq: 'Some workshop A, Some workshop B',
  description: 'Workshop description goes here.',
  notes: 'Bring your device. Stay hydrated!',
  courseOfferings: ['AI and Machine Learning', 'Apps with Devices'],
  facilitators: [
    {
      name: 'Facilitator A',
      email: 'facilitator@example.com',
      bio: 'Experienced CS instructor',
    },
  ],
};

describe('WorkshopDetails', () => {
  it('renders workshop name and grade levels', () => {
    render(<WorkshopDetails {...baseProps} />);
    expect(
      screen.getByRole('heading', {name: /Cybersecurity Basics Workshop/i})
    ).toBeInTheDocument();
    expect(screen.getByText(/grades:/i)).toBeInTheDocument();
    expect(screen.getByText(/k, 1, 2/i)).toBeInTheDocument();
  });

  it('renders prerequisites and fee', () => {
    render(<WorkshopDetails {...baseProps} />);
    expect(screen.getByText(/prerequisites:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/some workshop a, some workshop b/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/cost:/i)).toBeInTheDocument();
    expect(screen.getByText(/free/i)).toBeInTheDocument();
  });

  it('renders description and notes', () => {
    render(<WorkshopDetails {...baseProps} />);
    expect(
      screen.getByRole('heading', {name: /description/i})
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: /attendee notes/i})
    ).toBeInTheDocument();
    expect(screen.getByText(baseProps.notes)).toBeInTheDocument();
  });

  it('does not render notes if none provided', () => {
    render(<WorkshopDetails {...baseProps} notes="" />);
    expect(
      screen.queryByRole('heading', {name: /attendee notes/i})
    ).not.toBeInTheDocument();
    expect(screen.queryByText(baseProps.notes)).not.toBeInTheDocument();
  });

  it('renders course offering tags if provided', () => {
    render(<WorkshopDetails {...baseProps} />);
    baseProps.courseOfferings.forEach(course =>
      expect(screen.getByText(course)).toBeInTheDocument()
    );
  });

  it('renders facilitator info', () => {
    render(<WorkshopDetails {...baseProps} />);
    expect(screen.getByText(/facilitator a/i)).toBeInTheDocument();
    expect(screen.getByText(/facilitator@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/show biography/i)).toBeInTheDocument();
  });

  it('does not render facilitator info if none provided', () => {
    render(<WorkshopDetails {...baseProps} facilitators={undefined} />);
    expect(screen.queryByText(/facilitator a/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/show biography/i)).not.toBeInTheDocument();
  });

  it('renders data sharing notice section with anchor', () => {
    render(<WorkshopDetails {...baseProps} />);
    expect(
      screen.getByRole('heading', {name: /data sharing notice/i})
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Code\.org works closely with local Regional Partners/i)
    ).toBeInTheDocument();
    const anchorTarget = screen
      .getByRole('heading', {
        name: /data sharing notice/i,
      })
      .closest('section');
    expect(anchorTarget).toHaveAttribute('id', 'data-sharing-notice');
  });

  it('does not render course tags section if list is empty', () => {
    render(<WorkshopDetails {...baseProps} courseOfferings={[]} />);
    expect(screen.queryByText(/PL Topics Covered/i)).not.toBeInTheDocument();
  });
});
