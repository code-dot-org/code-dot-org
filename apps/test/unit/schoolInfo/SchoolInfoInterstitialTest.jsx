import '@testing-library/jest-dom';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import SchoolInfoInterstitial from '@cdo/apps/schoolInfo/SchoolInfoInterstitial';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import i18n from '@cdo/locale';

// Mock the dependencies
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

jest.mock('@cdo/apps/schoolInfo/utils/updateSchoolInfo', () => ({
  updateSchoolInfo: jest.fn(),
}));

const mockUpdateSchoolInfo = updateSchoolInfo;
const mockSendEvent = analyticsReporter.sendEvent;

describe('SchoolInfoInterstitial', () => {
  let mockFetch;
  let mockOnClose = jest.fn();

  const defaultProps = {
    scriptData: {
      existingSchoolInfo: {
        country: 'US',
        school_id: '123',
        school_name: 'Test School',
        school_zip: '12345',
      },
      usIp: true,
      formUrl: 'form/url',
      authTokenName: 'authTokenName',
      authTokenValue: 'authTokenValue',
    },
    onClose: mockOnClose,
  };

  function renderDefault(overrideProps = {}) {
    render(<SchoolInfoInterstitial {...defaultProps} {...overrideProps} />);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {nces_id: '1', name: 'Cool School'},
        {nces_id: '2', name: 'Other School'},
      ]),
    };
    mockFetch = jest.fn().mockResolvedValue(mockResponse);
    window.fetch = mockFetch;
  });

  it('should render the component correctly', async () => {
    renderDefault();
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });
  });

  it('should call sendEvent when component mounts', async () => {
    renderDefault();
    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SHOW,
        {},
        PLATFORMS.BOTH
      );
    });
  });

  it('should call sendEvent and updateSchoolInfo on save button click', async () => {
    renderDefault();

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdateSchoolInfo).toHaveBeenCalledWith({
        formUrl: 'form/url',
        authTokenName: 'authTokenName',
        authTokenValue: 'authTokenValue',
        schoolId: '123',
        country: 'US',
        schoolName: 'Test School',
        schoolZip: '12345',
      });

      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
        {
          hasNcesId: 'true',
          attempt: 1,
        },
        PLATFORMS.BOTH
      );

      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_SUCCESS,
        {
          attempt: 1,
        },
        PLATFORMS.BOTH
      );

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle errors from updateSchoolInfo and retry', async () => {
    mockUpdateSchoolInfo.mockRejectedValueOnce(new Error('Update failed'));

    renderDefault();

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
        {
          hasNcesId: 'true',
          attempt: 1,
        },
        PLATFORMS.BOTH
      );

      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_FAILURE,
        {
          attempt: 1,
        },
        PLATFORMS.BOTH
      );

      expect(
        screen.getByText(i18n.schoolInfoInterstitialUnknownError())
      ).toBeInTheDocument();
    });

    // second failure
    mockUpdateSchoolInfo.mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
        {
          hasNcesId: 'true',
          attempt: 2,
        },
        PLATFORMS.BOTH
      );

      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_FAILURE,
        {
          attempt: 2,
        },
        PLATFORMS.BOTH
      );

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call sendEvent on dismiss button click', async () => {
    await act(async () => {
      renderDefault();
    });

    fireEvent.click(screen.getByText('Dismiss'));

    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_DISMISS,
        {},
        PLATFORMS.BOTH
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  });
});
