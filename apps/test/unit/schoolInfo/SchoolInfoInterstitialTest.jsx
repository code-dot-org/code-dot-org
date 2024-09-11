import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import SchoolInfoInterstitial from '@cdo/apps/schoolInfo/SchoolInfoInterstitial';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import i18n from '@cdo/locale';

// Mock the dependencies
jest.mock('@cdo/apps/lib/util/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

jest.mock('@cdo/apps/schoolInfo/utils/updateSchoolInfo', () => ({
  updateSchoolInfo: jest.fn(),
}));

jest.mock('@cdo/apps/schoolInfo/hooks/useSchoolInfo', () => ({
  useSchoolInfo: jest.fn(),
}));

const mockUseSchoolInfo = useSchoolInfo;
const mockUpdateSchoolInfo = updateSchoolInfo;
const mockSendEvent = analyticsReporter.sendEvent;

describe('SchoolInfoInterstitial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSchoolInfo.mockReturnValue({
      country: 'US',
      schoolName: 'Test School',
      schoolId: '123',
      schoolZip: '12345',
      schoolsList: [],
      setCountry: jest.fn(),
      setSchoolName: jest.fn(),
      setSchoolId: jest.fn(),
      setSchoolZip: jest.fn(),
    });
  });

  it('should render the component correctly', () => {
    const mockOnClose = jest.fn();
    render(
      <SchoolInfoInterstitial
        scriptData={{
          existingSchoolInfo: {
            country: 'US',
            school_id: '123',
            school_name: 'Test School',
            school_zip: '12345',
          },
          usIp: true,
          formUrl: 'https://example.com',
          authTokenName: 'authTokenName',
          authTokenValue: 'authTokenValue',
        }}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('should call sendEvent when component mounts', () => {
    render(
      <SchoolInfoInterstitial
        scriptData={{
          existingSchoolInfo: {
            country: 'US',
            school_id: '123',
            school_name: 'Test School',
            school_zip: '12345',
          },
          usIp: true,
          formUrl: 'https://example.com',
          authTokenName: 'authTokenName',
          authTokenValue: 'authTokenValue',
        }}
        onClose={jest.fn()}
      />
    );

    expect(mockSendEvent).toHaveBeenCalledWith(
      EVENTS.SCHOOL_INTERSTITIAL_SHOW,
      {},
      PLATFORMS.BOTH
    );
  });

  it('should call sendEvent and updateSchoolInfo on save button click', async () => {
    mockUpdateSchoolInfo.mockResolvedValueOnce(undefined);
    const mockOnClose = jest.fn();

    render(
      <SchoolInfoInterstitial
        scriptData={{
          existingSchoolInfo: {
            country: 'US',
            school_id: '123',
            school_name: 'Test School',
            school_zip: '12345',
          },
          usIp: true,
          formUrl: 'https://example.com',
          authTokenName: 'authTokenName',
          authTokenValue: 'authTokenValue',
        }}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdateSchoolInfo).toHaveBeenCalledWith({
        formUrl: 'https://example.com',
        authTokenName: 'authTokenName',
        authTokenValue: 'authTokenValue',
        schoolId: '123',
        country: 'US',
        schoolName: 'Test School',
        schoolZip: '12345',
      });

      expect(mockSendEvent).toHaveBeenNthCalledWith(
        2,
        EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
        {
          hasNcesId: 'true',
          attempt: 1,
        },
        PLATFORMS.BOTH
      );

      expect(mockSendEvent).toHaveBeenNthCalledWith(
        3,
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
    mockUpdateSchoolInfo.mockRejectedValue(new Error('Update failed'));
    const mockOnClose = jest.fn();

    render(
      <SchoolInfoInterstitial
        scriptData={{
          existingSchoolInfo: {
            country: 'US',
            school_id: '123',
            school_name: 'Test School',
            school_zip: '12345',
          },
          usIp: true,
          formUrl: 'https://example.com',
          authTokenName: 'authTokenName',
          authTokenValue: 'authTokenValue',
        }}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenNthCalledWith(
        2,
        EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
        {
          hasNcesId: 'true',
          attempt: 1,
        },
        PLATFORMS.BOTH
      );

      expect(mockSendEvent).toHaveBeenNthCalledWith(
        3,
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

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenNthCalledWith(
        4,
        EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
        {
          hasNcesId: 'true',
          attempt: 2,
        },
        PLATFORMS.BOTH
      );

      expect(mockSendEvent).toHaveBeenNthCalledWith(
        5,
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_FAILURE,
        {
          attempt: 2,
        },
        PLATFORMS.BOTH
      );

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call sendEvent on dismiss button click', () => {
    const mockOnClose = jest.fn();
    render(
      <SchoolInfoInterstitial
        scriptData={{
          existingSchoolInfo: {
            country: 'US',
            school_id: '123',
            school_name: 'Test School',
            school_zip: '12345',
          },
          usIp: true,
          formUrl: 'https://example.com',
          authTokenName: 'authTokenName',
          authTokenValue: 'authTokenValue',
        }}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Dismiss'));

    expect(mockSendEvent).toHaveBeenCalledWith(
      EVENTS.SCHOOL_INTERSTITIAL_DISMISS,
      {},
      PLATFORMS.BOTH
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
