import {render} from '@testing-library/react';
import React from 'react';

import WorkshopEventJsonLdData from '@cdo/apps/code-studio/pd/workshops/components/WorkshopEventJsonLdData';
import {
  GetWorkshopInfoScriptDataResponse,
  SessionInfo,
} from '@cdo/apps/code-studio/pd/workshops/types';

describe('WorkshopEventJsonLdData', () => {
  const mockData: GetWorkshopInfoScriptDataResponse = {
    id: 1,
    name: 'Sample Workshop',
    description: 'Workshop Description',
    sessions: [
      {
        id: 1,
        start: '2025-06-10T10:00:00Z',
        end: '2025-06-10T12:00:00Z',
        is_local: true,
        session_format: 'virtual',
      } as SessionInfo,
    ],
    format: 'in_person',
    location_name: 'Sample Location',
    fee: '100',
    capacity: 10,
    num_enrollments: 5,
    organizer: {name: 'Organizer Name', email: 'organizer@email.com'},
    regional_partner_name: 'Regional Partner',
    grade_levels: ['K', '1', '2'],
    course: 'CS Fundamentals',
    subject: 'Computer Science',
    course_offerings: ['Course A'],
  };

  it('renders JSON-LD data correctly', () => {
    render(<WorkshopEventJsonLdData {...mockData} />);
    const scriptTag = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(scriptTag).toBeTruthy();

    const json = JSON.parse(scriptTag!.innerHTML);
    expect(json['@type']).toBe('EducationEvent');
    expect(json.name).toBe('Sample Workshop');
    expect(json.location.name).toBe('Sample Location');
    expect(json.organizer.name).toBe('Organizer Name');
    expect(json.audience.name).toBe('Kindergarten, Grades 1-2');
    expect(json.offers.price).toBe(100);
  });
});
