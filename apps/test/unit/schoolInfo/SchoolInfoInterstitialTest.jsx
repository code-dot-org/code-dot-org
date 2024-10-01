import '@testing-library/jest-dom';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SchoolInfoInterstitial from '@cdo/apps/schoolInfo/SchoolInfoInterstitial';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import {
  CLICK_TO_ADD,
  NO_SCHOOL_SETTING,
  SELECT_A_SCHOOL,
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
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
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: SELECT_COUNTRY,
              school_id: SELECT_A_SCHOOL,
              school_name: '',
              school_zip: '',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeDisabled();
    });
  });

  describe('US country selected', () => {
    it('disables submit form if zip code is missing', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: US_COUNTRY_CODE,
              school_id: 'abc',
              school_name: '',
              school_zip: '',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeDisabled();
    });

    it('disables submit form if school is not selected and not named', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: US_COUNTRY_CODE,
              school_id: SELECT_A_SCHOOL,
              school_name: '',
              school_zip: '12345',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeDisabled();
    });

    it('enables submit form if zip is provided and not in a school setting', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: US_COUNTRY_CODE,
              school_id: NO_SCHOOL_SETTING,
              school_name: '',
              school_zip: '12345',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeEnabled();

      fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

      expect(mockUpdateSchoolInfo).toHaveBeenCalled();
    });

    it('enables submit with US and school id from dropdown', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: US_COUNTRY_CODE,
              school_id: '1',
              school_name: '',
              school_zip: '12345',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeEnabled();

      fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

      expect(mockUpdateSchoolInfo).toHaveBeenCalled();
    });

    it('enables submit with US and school name', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: 'US',
              school_id: CLICK_TO_ADD,
              school_name: 'Cool School',
              school_zip: '12345',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeEnabled();

      fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

      expect(mockUpdateSchoolInfo).toHaveBeenCalled();
    });
  });

  describe('non-US country selected', () => {
    it('disables submit with only non-US country', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: 'UK',
              school_id: SELECT_A_SCHOOL,
              school_name: '',
              school_zip: '',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeDisabled();
    });

    it('enables submit with non-US and school name', async () => {
      await act(async () => {
        renderDefault({
          scriptData: {
            ...defaultProps.scriptData,
            existingSchoolInfo: {
              country: 'UK',
              school_id: SELECT_A_SCHOOL,
              school_name: 'UK School',
              school_zip: '',
            },
            usIp: false,
          },
        });
      });

      expect(screen.getByRole('button', {name: i18n.save()})).toBeEnabled();

      fireEvent.click(screen.getByRole('button', {name: i18n.save()}));

      expect(mockUpdateSchoolInfo).toHaveBeenCalled();
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
