import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import TeacherPromotions from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherPromotions';
import HttpClient from '@cdo/apps/util/HttpClient';
import * as localStorageUtils from '@cdo/apps/utils';

jest.mock('@cdo/apps/util/HttpClient');
jest.mock('@cdo/apps/utils', () => ({
  trySetLocalStorage: jest.fn(),
  tryGetLocalStorage: jest.fn().mockReturnValue(null),
}));

describe('TeacherPromotions', () => {
  const mockPromotions = [
    {
      id: '1',
      announcement_type: 'New Curriculum',
      background_color: 'Blue',
      title: 'Promotion 1',
      description: 'Description 1',
      button_label: 'Learn More',
      button_target: '/promo1',
      image: '/image1.png',
      is_closable: true,
    },
    {
      id: '2',
      announcement_type: 'Announcement',
      background_color: 'Gray',
      title: 'Promotion 2',
      description: 'Description 2',
      button_label: 'Sign Up',
      button_target: '/promo2',
      image: '/image2.png',
      is_closable: false,
    },
  ];

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    fetchSpy.mockResolvedValue({value: [], response: new Response()});
    render(<TeacherPromotions />);
    screen.getByLabelText('Loading...');
  });

  it('renders promotions after loading', async () => {
    fetchSpy.mockResolvedValue({
      value: mockPromotions,
      response: new Response(),
    });

    render(<TeacherPromotions />);

    await screen.findByText('Promotion 1');
    await screen.findByText('Promotion 2');
  });

  it('handles close promotion callback', async () => {
    fetchSpy.mockResolvedValue({
      value: mockPromotions,
      response: new Response(),
    });

    render(<TeacherPromotions />);

    await screen.findByText('Promotion 1');

    const closeButton = screen.getByRole('button', {name: 'Close'});
    userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Promotion 1')).toBeNull();
      screen.getByText('Promotion 2');
    });
  });

  it('handles HTTP errors gracefully', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));

    render(<TeacherPromotions />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).toBeNull();
    });

    // Ensure no promotions are rendered
    await waitFor(() => {
      expect(screen.queryByText('Promotion 1')).toBeNull();
      expect(screen.queryByText('Promotion 2')).toBeNull();
    });
  });

  it('does not show closed promotions', async () => {
    jest.spyOn(localStorageUtils, 'tryGetLocalStorage').mockReturnValue(
      JSON.stringify(['1']) // Promotion with ID 1 is closed
    );

    fetchSpy.mockResolvedValue({
      value: mockPromotions,
      response: new Response(),
    });

    render(<TeacherPromotions />);

    await screen.findByText('Promotion 2'); // Only Promotion 2 should be visible
    expect(screen.queryByText('Promotion 1')).toBeNull();
  });

  it('calls trySetLocalStorage when a promotion is closed', async () => {
    jest.spyOn(localStorageUtils, 'tryGetLocalStorage').mockReturnValue('[]');

    fetchSpy.mockResolvedValue({
      value: mockPromotions,
      response: new Response(),
    });

    render(<TeacherPromotions />);

    await screen.findByText('Promotion 1');

    const closeButton = screen.getByRole('button', {name: 'Close'});
    userEvent.click(closeButton);

    await waitFor(() => {
      expect(localStorageUtils.trySetLocalStorage).toHaveBeenCalledWith(
        'teacherPromotionClosed',
        JSON.stringify(['1'])
      );
    });
  });

  it('removes closed promotions from local storage if not in received promotions', async () => {
    jest.spyOn(localStorageUtils, 'tryGetLocalStorage').mockReturnValue(
      JSON.stringify(['3']) // Promotion with ID 3 is no longer valid
    );

    fetchSpy.mockResolvedValue({
      value: mockPromotions,
      response: new Response(),
    });

    render(<TeacherPromotions />);

    await screen.findByText('Promotion 1');

    const closeButton = screen.getByRole('button', {name: 'Close'});
    userEvent.click(closeButton);

    await waitFor(() => {
      expect(localStorageUtils.trySetLocalStorage).toHaveBeenCalledWith(
        'teacherPromotionClosed',
        JSON.stringify(['1'])
      );
    });
  });
});
