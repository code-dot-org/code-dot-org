import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import RegionalWorkshopCatalog from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalog';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockResolvedValue('authToken'),
}));

const TEST_WORKSHOPS = [
  {
    id: 1,
    name: 'Regional Seattle Workshop',
    course: 'Test Course 1',
    subject: 'Test Subject',
    dates: '1/1/2000',
    sessions: [],
    participant_group_type: 'Regional',
    location: 'Seattle 111',
    location_name: 'Seattle Public School',
    location_address: 'Seattle 111',
    on_map: false,
    funded: false,
    virtual: false,
    enrolled_teacher_count: 0,
    capacity: 1,
    facilitators: ['Mx. Facilitator'],
    organizer: {name: 'Mx. Organizer'},
    enrollment_code: 'ABCD',
    status: 'Not Started',
  },
  {
    id: 2,
    name: 'National Austin Workshop',
    course: 'Test Course 2',
    subject: 'Test Subject',
    dates: '1/1/2000',
    sessions: [],
    participant_group_type: 'National',
    location: 'Austin 111',
    location_name: 'Austin Public School',
    location_address: 'Austin 111',
    on_map: false,
    funded: false,
    virtual: false,
    enrolled_teacher_count: 0,
    capacity: 1,
    facilitators: ['Mx. Facilitator'],
    organizer: {name: 'Mx. Organizer'},
    enrollment_code: 'ABCD',
    status: 'Not Started',
  },
];

describe('RegionalWorkshopCatalog', () => {
  it('page defaults to telling the user they need to enter a zip code', () => {
    render(<RegionalWorkshopCatalog />);
    screen.getByText('Enter zip code to see workshops');

    // No regional partner retrieved with an empty zip
    screen.getByText('Zip code required');
  });

  it('shows no workshop display when entered zip code yields no workshops', async () => {
    const zip = '11111';
    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: '', additional_info: ''},
            available_workshops: [],
          },
        }),
    });
    render(<RegionalWorkshopCatalog />);

    fireEvent.change(screen.getByRole('textbox', {name: 'zipSearch'}), {
      target: {value: zip},
    });
    fireEvent.click(screen.getByRole('button', {name: 'submitZip'}));

    await waitFor(() => {
      screen.getByText('No workshops found');
      screen.getByText('No regional partner found');

      expect(fetchStub).toHaveBeenCalledWith(`regional_workshop_data/${zip}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'authToken',
        },
        method: 'GET',
      });
      fetchStub.mockRestore();
    });
  });

  it('shows workshops available to that zip code', async () => {
    const zip = '98122';
    const regionalPartnerName = 'Reggie Partner';

    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: regionalPartnerName},
            available_workshops: TEST_WORKSHOPS,
          },
        }),
    });
    render(<RegionalWorkshopCatalog />);

    fireEvent.change(screen.getByRole('textbox', {name: 'zipSearch'}), {
      target: {value: zip},
    });
    fireEvent.click(screen.getByRole('button', {name: 'submitZip'}));

    await waitFor(() => {
      screen.getByText(regionalPartnerName);
      screen.getByText('Upcoming workshops');
      TEST_WORKSHOPS.forEach(ws =>
        screen.getByText(
          `Id: ${ws.id}, Title: ${ws.name}, Location: ${ws.location_name}, Participant Group Type: ${ws.participant_group_type}`
        )
      );

      expect(fetchStub).toHaveBeenCalledWith(`regional_workshop_data/${zip}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'authToken',
        },
        method: 'GET',
      });
      fetchStub.mockRestore();
    });
  });

  it('can open and close regional partner info dialog if regional partner is present', async () => {
    const zip = '98122';
    const regionalPartnerName = 'Reggie Partner';
    const regionalPartnerInfo = 'Test partner info.';

    jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {
              name: regionalPartnerName,
              additional_info: regionalPartnerInfo,
            },
            available_workshops: TEST_WORKSHOPS,
          },
        }),
    });
    render(<RegionalWorkshopCatalog />);

    // Button to open dialog starts not enabled
    expect(screen.getByRole('button', {name: 'partnerInfo'})).toBeDisabled();

    // Button to open dialog only becomes enabled once a zip has been entered and a regional partner is found
    fireEvent.change(screen.getByRole('textbox', {name: 'zipSearch'}), {
      target: {value: zip},
    });
    fireEvent.click(screen.getByRole('button', {name: 'submitZip'}));

    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: 'partnerInfo'})
      ).not.toBeDisabled();
    });

    // Can open dialog
    fireEvent.click(screen.getByRole('button', {name: 'partnerInfo'}));
    await waitFor(() => {
      expect(screen.getAllByText(regionalPartnerName).length).toBe(2);
      screen.getByText(regionalPartnerInfo);
    });

    // Can close dialog
    fireEvent.click(screen.getByRole('button', {name: 'Return to workshops'}));
    await waitFor(() => {
      expect(screen.getAllByText(regionalPartnerName).length).toBe(1);
      expect(screen.queryByText(regionalPartnerInfo)).toBe(null);
    });
  });
});
