import '@testing-library/jest-dom';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SchoolInfoInterstitial from '@cdo/apps/schoolInfo/SchoolInfoInterstitial';
import {schoolInfoInvalid} from '@cdo/apps/schoolInfo/utils/schoolInfoInvalid';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import i18n from '@cdo/locale';

// Mock the dependencies
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

jest.mock('@cdo/apps/schoolInfo/utils/updateSchoolInfo', () => ({
  updateSchoolInfo: jest.fn(),
}));
jest.mock('@cdo/apps/schoolInfo/utils/schoolInfoInvalid', () => ({
  schoolInfoInvalid: jest.fn(),
}));

const mockUpdateSchoolInfo = updateSchoolInfo;
const mockSendEvent = analyticsReporter.sendEvent;
const mockSchoolInfoInvalid = schoolInfoInvalid;

describe('SchoolInfoInterstitial', () => {
  let mockFetch;
  let mockOnClose = jest.fn();

  const defaultProps = {
    scriptData: {
      existingSchoolInfo: {
        country: 'US',
        school_id: '1',
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
    mockSchoolInfoInvalid.mockReturnValue(false);
  });

  it('should render the component correctly', async () => {
    renderDefault();
    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: i18n.save()})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: i18n.dismiss()})
      ).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.getByRole('button', {name: i18n.save()})).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

    await waitFor(() => {
      expect(mockUpdateSchoolInfo).toHaveBeenCalledWith({
        schoolId: '1',
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

    await waitFor(() => {
      expect(screen.getByRole('button', {name: i18n.save()})).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

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

    fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

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

    fireEvent.click(screen.getByRole('button', {name: i18n.dismiss()}));

    await waitFor(() => {
      expect(mockSendEvent).toHaveBeenCalledWith(
        EVENTS.SCHOOL_INTERSTITIAL_DISMISS,
        {},
        PLATFORMS.BOTH
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('initial school info state', () => {
    it('disables submit form with no info', async () => {
      mockSchoolInfoInvalid.mockReturnValue(true);
      await act(async () => {
        renderDefault();
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeDisabled();
    });
  });

  it('shows an error message on first failed submission', async () => {
    mockUpdateSchoolInfo.mockRejectedValueOnce(new Error('Update failed'));

    await act(async () => {
      renderDefault();
    });

    fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

    await waitFor(() => {
      expect(
        screen.getByText(i18n.schoolInfoInterstitialUnknownError())
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('closes the dialog on a second failed submission', async () => {
    mockUpdateSchoolInfo.mockRejectedValueOnce(new Error('Update failed'));

    await act(async () => {
      renderDefault();
    });

    fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

    await waitFor(() => {
      expect(
        screen.getByText(i18n.schoolInfoInterstitialUnknownError())
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    // second failure
    mockUpdateSchoolInfo.mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
