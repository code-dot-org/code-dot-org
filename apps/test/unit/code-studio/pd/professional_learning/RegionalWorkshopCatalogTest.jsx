import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import RegionalWorkshopCatalog from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalog';
import {
  setWindowLocation,
  resetWindowLocation,
  updateQueryParam,
} from '@cdo/apps/code-studio/utils';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockResolvedValue('authToken'),
}));

const REGIONAL_PARTNER = 'Reggie Partner';

const TEST_SESSION_1 = {
  id: 1,
  start: '2025-04-22T13:00:00Z',
  end: '2025-04-22T21:00:00Z',
  is_local: false,
};

const TEST_SESSION_2 = {
  id: 2,
  start: '2025-05-22T13:00:00Z',
  end: '2025-05-22T21:00:00Z',
  is_local: false,
};

const TEST_NATIONAL_WORKSHOP = {
  id: 3,
  course: 'Test Course 3',
  subject: 'Test Subject',
  name: 'National Scottsdale Workshop',
  capacity: 5,
  num_enrollments: 2,
  sessions: [TEST_SESSION_2],
  format: 'In-Person',
  location_name: 'Seattle Public School',
  fee: null,
  has_prereq: false,
  description: 'Test description',
  custom_registration_link: null,
};

const TEST_REGIONAL_WORKSHOPS = [
  {
    id: 1,
    course: 'Test Course 1',
    subject: 'Test Subject',
    name: 'North Seattle Workshop',
    capacity: 5,
    num_enrollments: 2,
    sessions: [TEST_SESSION_1],
    format: 'In-Person',
    location_name: 'Seattle Public School',
    fee: null,
    has_prereq: false,
    description: 'Test description',
    custom_registration_link: null,
  },
  {
    id: 2,
    course: 'Test Course 2',
    subject: 'Test Subject',
    name: 'South Seattle Workshop',
    capacity: 5,
    num_enrollments: 4,
    sessions: [TEST_SESSION_1],
    format: 'Virtual',
    location_name: 'Seattle Private School',
    fee: '$400',
    has_prereq: true,
    description: 'Test description',
    custom_registration_link: null,
  },
];

const renderDefault = (overrideProps = {}) => {
  const props = {
    ...{
      nationalWorkshops: [TEST_NATIONAL_WORKSHOP],
      zipFromSchoolInfo: '',
    },
    ...overrideProps,
  };
  render(<RegionalWorkshopCatalog {...props} />);
};

describe('RegionalWorkshopCatalog', () => {
  afterEach(() => {
    updateQueryParam('zip', null, true);
  });

  it('page defaults to telling the user they need to enter a zip code', () => {
    renderDefault();
    screen.getByText('Enter zip code to see workshops');

    // No regional partner retrieved with an empty zip
    screen.getByText('Zip code required');

    // Still shows National workshops
    expect(screen.getAllByText('National workshops').length).toBe(2);
    screen.getByText(TEST_NATIONAL_WORKSHOP.name);
  });

  it('shows no workshop display when entered zip code yields no regional workshops', async () => {
    const zip = '11111';
    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: '', additional_info: ''},
            available_regional_workshops: [],
          },
        }),
    });
    renderDefault();

    fireEvent.change(screen.getByRole('textbox', {name: 'zipSearch'}), {
      target: {value: zip},
    });
    fireEvent.click(screen.getByRole('button', {name: 'submitZip'}));

    await waitFor(() => {
      screen.getByText('No workshops found');
      screen.getByText('No regional partner found');
      expect(
        screen.getByRole('link', {
          name: 'Contact regional partner',
        })
      ).toHaveAttribute(
        'href',
        '/professional-learning/contact-regional-partner?zip=11111'
      );

      expect(fetchStub).toHaveBeenCalledWith(
        `/professional-learning/regional_workshop_data/${zip}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          method: 'GET',
        }
      );

      // Still shows National workshops
      expect(screen.getAllByText('National workshops').length).toBe(2);
      screen.getByText(TEST_NATIONAL_WORKSHOP.name);

      fetchStub.mockRestore();
    });
  });

  it('shows regional workshops available to that zip code', async () => {
    const zip = '98122';

    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: REGIONAL_PARTNER},
            available_regional_workshops: TEST_REGIONAL_WORKSHOPS,
          },
        }),
    });
    renderDefault();

    fireEvent.change(screen.getByRole('textbox', {name: 'zipSearch'}), {
      target: {value: zip},
    });
    fireEvent.click(screen.getByRole('button', {name: 'submitZip'}));

    await waitFor(() => {
      // Regional Partner name and contact
      screen.getByText(REGIONAL_PARTNER);
      expect(
        screen.getByRole('link', {
          name: 'Contact',
        })
      ).toHaveAttribute(
        'href',
        `/professional-learning/contact-regional-partner?zip=${zip}`
      );

      // Regional workshop content is displayed
      expect(
        screen.getByRole('link', {
          name: 'contact your regional partner',
        })
      ).toHaveAttribute(
        'href',
        `/professional-learning/contact-regional-partner?zip=${zip}`
      );
      TEST_REGIONAL_WORKSHOPS.forEach(ws => screen.getByText(ws.name));

      expect(fetchStub).toHaveBeenCalledWith(
        `/professional-learning/regional_workshop_data/${zip}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          method: 'GET',
        }
      );

      // Still shows National workshops
      expect(screen.getAllByText('National workshops').length).toBe(2);
      screen.getByText(TEST_NATIONAL_WORKSHOP.name);

      fetchStub.mockRestore();
    });
  });

  it('can open and close regional partner info dialog if regional partner is present', async () => {
    const zip = '98122';
    const regionalPartnerInfo = 'Test partner info.';

    jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {
              name: REGIONAL_PARTNER,
              additional_info: regionalPartnerInfo,
            },
            available_regional_workshops: TEST_REGIONAL_WORKSHOPS,
          },
        }),
    });
    renderDefault();

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
      expect(screen.getAllByText(REGIONAL_PARTNER).length).toBe(2);
      screen.getByText(regionalPartnerInfo);
    });

    // Can close dialog
    fireEvent.click(screen.getByRole('button', {name: 'Return to workshops'}));
    await waitFor(() => {
      expect(screen.getAllByText(REGIONAL_PARTNER).length).toBe(1);
      expect(screen.queryByText(regionalPartnerInfo)).toBe(null);

      // Still shows National workshops
      expect(screen.getAllByText('National workshops').length).toBe(2);
      screen.getByText(TEST_NATIONAL_WORKSHOP.name);
    });
  }, 10000);

  it('immediately shows regional workshops available to given zip code if provided in url', async () => {
    const zip = '98122';

    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: REGIONAL_PARTNER},
            available_regional_workshops: TEST_REGIONAL_WORKSHOPS,
          },
        }),
    });
    setWindowLocation({search: `?zip=${zip}`});
    renderDefault();

    await waitFor(() => {
      // Regional Partner name and contact
      screen.getByText(REGIONAL_PARTNER);
      expect(
        screen.getByRole('link', {
          name: 'Contact',
        })
      ).toHaveAttribute(
        'href',
        `/professional-learning/contact-regional-partner?zip=${zip}`
      );

      // Regional workshop content is displayed
      TEST_REGIONAL_WORKSHOPS.forEach(ws => screen.getByText(ws.name));

      expect(fetchStub).toHaveBeenCalledWith(
        `/professional-learning/regional_workshop_data/${zip}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          method: 'GET',
        }
      );

      // Still shows National workshops
      expect(screen.getAllByText('National workshops').length).toBe(2);
      screen.getByText(TEST_NATIONAL_WORKSHOP.name);

      resetWindowLocation();
      fetchStub.mockRestore();
    });
  });

  it('immediately shows workshops available to given zip code if provided as a parameter', async () => {
    const zip = '98122';

    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: REGIONAL_PARTNER},
            available_regional_workshops: TEST_REGIONAL_WORKSHOPS,
          },
        }),
    });
    renderDefault({zipFromSchoolInfo: zip});

    await waitFor(() => {
      // Regional Partner name and contact
      screen.getByText(REGIONAL_PARTNER);
      expect(
        screen.getByRole('link', {
          name: 'Contact',
        })
      ).toHaveAttribute(
        'href',
        `/professional-learning/contact-regional-partner?zip=${zip}`
      );

      // Regional workshop content is displayed
      TEST_REGIONAL_WORKSHOPS.forEach(ws => screen.getByText(ws.name));

      expect(fetchStub).toHaveBeenCalledWith(
        `/professional-learning/regional_workshop_data/${zip}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'authToken',
          },
          method: 'GET',
        }
      );

      // Still shows National workshops
      expect(screen.getAllByText('National workshops').length).toBe(2);
      screen.getByText(TEST_NATIONAL_WORKSHOP.name);

      fetchStub.mockRestore();
    });
  });

  it('does not show national workshops if none are present', () => {
    renderDefault({nationalWorkshops: []});

    // Only shows one instance of "National workshops", which is the skip link at the top of the page.
    expect(screen.getAllByText('National workshops').length).toBe(1);
    expect(screen.getByRole('link', {name: 'National workshops'}));
    expect(screen.queryByText(TEST_NATIONAL_WORKSHOP.name)).toBe(null);
  });

  it('shows national workshop under regional workshop section if its rp is returned in the zip search', async () => {
    const fetchStub = jest.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          regional_workshop_data: {
            regional_partner: {name: REGIONAL_PARTNER},
            available_regional_workshops: [TEST_NATIONAL_WORKSHOP],
          },
        }),
    });
    renderDefault({zipFromSchoolInfo: '98122'});

    await waitFor(() => {
      // Since the 1 national workshop is shown in the regional workshop section, the national workshop
      // section has no workshops to display so it doesn't show up. The only remaining use of "National
      // workshops" is the anchor link at the top of the page.
      expect(screen.getAllByText('National workshops').length).toBe(1);

      // National workshop is instead displayed with the regional workshops
      screen.getByText('Upcoming local workshops');
      screen.getByText(TEST_NATIONAL_WORKSHOP.name);

      fetchStub.mockRestore();
    });
  });
});
