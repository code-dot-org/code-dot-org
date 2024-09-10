import {waitFor} from '@testing-library/react';
import {act, renderHook} from '@testing-library/react-hooks';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {
  CLICK_TO_ADD,
  NO_SCHOOL_SETTING,
  SCHOOL_COUNTRY_SESSION_KEY,
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  SELECT_A_SCHOOL,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';

jest.mock('@cdo/apps/lib/util/AnalyticsReporter');
jest.mock('@cdo/apps/util/AuthenticityTokenStore');
jest.mock('@cdo/apps/schoolInfo/utils/fetchSchools');

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};

  return {
    getItem: jest.fn().mockImplementation(key => {
      return store[key] || null;
    }),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {value: mockSessionStorage});

describe('useSchoolInfo', () => {
  let fetchSchoolsSpy;
  let sendAnalyticsEventSpy;

  const initialState = {
    country: 'INITIAL_COUNTRY',
    schoolId: 'INITIAL_ID',
    schoolName: 'INITIAL_NAME',
    schoolZip: '00000',
  };

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    const mockResponse = {ok: true, json: jest.fn().mockResolvedValue([])};
    window.fetch = jest.fn().mockResolvedValue(mockResponse);

    fetchSchoolsSpy = jest
      .spyOn(require('@cdo/apps/schoolInfo/utils/fetchSchools'), 'fetchSchools')
      .mockResolvedValue([
        {nces_id: initialState.schoolId, name: initialState.schoolName},
      ]);

    sendAnalyticsEventSpy = jest.spyOn(
      require('@cdo/apps/lib/util/AnalyticsReporter'),
      'sendEvent'
    );
  });

  it('should use initialState instead of sessionStorage if passed', async () => {
    await act(async () => {
      sessionStorage.setItem(SCHOOL_COUNTRY_SESSION_KEY, US_COUNTRY_CODE);
      sessionStorage.setItem(SCHOOL_ID_SESSION_KEY, '2');
      sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, 'Stored School');
      sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, '54321');

      const {result, waitForNextUpdate} = renderHook(() =>
        useSchoolInfo(initialState)
      );

      await waitForNextUpdate();

      expect(result.current.country).toBe(initialState.country);
      expect(result.current.schoolId).toBe(initialState.schoolId);
      expect(result.current.schoolName).toBe(initialState.schoolName);
      expect(result.current.schoolZip).toBe(initialState.schoolZip);
    });
  });

  it('should use sessionStorage if no initialState is passed', async () => {
    await act(async () => {
      sessionStorage.setItem(SCHOOL_COUNTRY_SESSION_KEY, US_COUNTRY_CODE);
      sessionStorage.setItem(SCHOOL_ID_SESSION_KEY, '2');
      sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, 'Stored School');
      sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, '54321');

      const {result, waitForNextUpdate} = renderHook(() => useSchoolInfo({}));

      await waitForNextUpdate();

      expect(result.current.country).toBe(US_COUNTRY_CODE);
      expect(result.current.schoolId).toBe('2');
      expect(result.current.schoolName).toBe('Stored School');
      expect(result.current.schoolZip).toBe('54321');
    });
  });

  describe('hook state updates', () => {
    let hook;
    beforeEach(async () => {
      await act(async () => {
        const {result, waitForNextUpdate} = renderHook(() =>
          useSchoolInfo(initialState)
        );

        hook = result;

        await waitForNextUpdate(); // Wait for initial render
      });
    });

    describe('country updates', () => {
      it('should update sessionStorage', async () => {
        act(() => {
          hook.current.setCountry('US');
        });

        waitFor(() => {
          const schoolCountrySessionStorageCalls =
            mockSessionStorage.setItem.mock.calls.filter(
              ([key]) => key === SCHOOL_COUNTRY_SESSION_KEY
            );
          expect(schoolCountrySessionStorageCalls).toHaveLength(2);
          expect(schoolCountrySessionStorageCalls[0][1]).toBe(
            initialState.country
          );
          expect(schoolCountrySessionStorageCalls[1][1]).toBe('US');
        });
      });

      it('should reset schoolId, schoolZip, schoolName, and schoolsList state', async () => {
        waitFor(() => {
          expect(hook.current.schoolId).toBe(initialState.schoolId);
          expect(hook.current.schoolZip).toBe(initialState.schoolZip);
          expect(hook.current.schoolName).toBe(initialState.schoolName);
          expect(hook.current.schoolsList).toEqual([
            {nces_id: initialState.schoolId, name: initialState.schoolName},
          ]);
        });

        act(() => {
          hook.current.setCountry('US');
        });

        expect(hook.current.schoolId).toBe(SELECT_A_SCHOOL);
        expect(hook.current.schoolZip).toBe('');
        expect(hook.current.schoolName).toBe('');
        expect(hook.current.schoolsList).toEqual([]);
      });

      it('should send an analytics event', async () => {
        act(() => {
          hook.current.setCountry('US');
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.COUNTRY_SELECTED,
          {country: 'US'},
          PLATFORMS.BOTH
        );
      });
    });

    describe('schoolZip updates', () => {
      it('should update sessionStorage if zip is valid', async () => {
        // valid zip sets session storage
        // AND fetches schools, so act needs to be awaited
        await act(async () => {
          hook.current.setSchoolZip('90210');
        });

        waitFor(() => {
          const schoolZipSessionStorageCalls =
            mockSessionStorage.setItem.mock.calls.filter(
              ([key]) => key === SCHOOL_ID_SESSION_KEY
            );
          expect(schoolZipSessionStorageCalls).toHaveLength(2);
          expect(schoolZipSessionStorageCalls[0][1]).toBe('');
          expect(schoolZipSessionStorageCalls[1][1]).toBe('90210');
        });
      });

      it('should clear sessionStorage schoolZip if zip is valid', async () => {
        // invalid zip clears session storage
        act(() => {
          hook.current.setSchoolZip('BADZIP');
        });

        waitFor(() => {
          const schoolZipSessionStorageCalls =
            mockSessionStorage.setItem.mock.calls.filter(
              ([key]) => key === SCHOOL_ID_SESSION_KEY
            );
          expect(schoolZipSessionStorageCalls).toHaveLength(3);
          expect(schoolZipSessionStorageCalls[0][1]).toBe('');
          expect(schoolZipSessionStorageCalls[1][1]).toBe('90210');
          expect(schoolZipSessionStorageCalls[1][1]).toBe('');
        });
      });

      it('should reset schoolId, schoolName, and schoolsList state', async () => {
        waitFor(() => {
          expect(hook.current.schoolId).toBe(initialState.schoolId);
          expect(hook.current.schoolName).toBe(initialState.schoolName);
          expect(hook.current.schoolsList).toEqual([
            {nces_id: initialState.schoolId, name: initialState.schoolName},
          ]);
        });

        await act(async () => {
          hook.current.setSchoolZip('90210');
        });

        waitFor(() => {
          expect(hook.current.schoolZip).toBe('90210');
          expect(hook.current.schoolId).toBe(SELECT_A_SCHOOL);
          expect(hook.current.schoolName).toBe('');
          expect(hook.current.schoolsList).toEqual([]);
        });
      });

      it('should send an analytics event', async () => {
        act(() => {
          hook.current.setSchoolZip('90210');
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.ZIP_CODE_ENTERED,
          {zip: '90210'},
          PLATFORMS.BOTH
        );
      });

      it('should fetch schools', async () => {
        act(() => {
          hook.current.setSchoolZip('90210');
        });

        expect(fetchSchoolsSpy).toHaveBeenCalledWith(
          '90210',
          expect.any(Function)
        );
      });

      it('should validate zip code correctly', async () => {
        act(() => {
          hook.current.setSchoolZip('BADZIP');
        });

        expect(hook.current.schoolZipIsValid).toBe(false);

        act(() => {
          hook.current.setSchoolZip('90210');
        });

        expect(hook.current.schoolZipIsValid).toBe(true);

        act(() => {
          hook.current.setSchoolZip('902101');
        });

        expect(hook.current.schoolZipIsValid).toBe(false);
      });
    });

    describe('schoolId updates', () => {
      it('should update sessionStorage', async () => {
        act(() => {
          hook.current.setSchoolId('ABC123');
        });

        waitFor(() => {
          const schoolIdSessionStorageCalls =
            mockSessionStorage.setItem.mock.calls.filter(
              ([key]) => key === SCHOOL_ID_SESSION_KEY
            );
          expect(schoolIdSessionStorageCalls).toHaveLength(2);
          expect(schoolIdSessionStorageCalls[0][1]).toBe(initialState.schoolId);
          expect(schoolIdSessionStorageCalls[1][1]).toBe('ABC123');
        });
      });

      it('should send analytics events', async () => {
        act(() => {
          hook.current.setSchoolId(NO_SCHOOL_SETTING);
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.DO_NOT_TEACH_AT_SCHOOL_CLICKED,
          {},
          PLATFORMS.BOTH
        );

        act(() => {
          hook.current.setSchoolId(CLICK_TO_ADD);
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.ADD_MANUALLY_CLICKED,
          {},
          PLATFORMS.BOTH
        );

        act(() => {
          hook.current.setSchoolId('NEW_NCES_ID');
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.SCHOOL_SELECTED_FROM_LIST,
          {'nces Id': 'NEW_NCES_ID'},
          PLATFORMS.BOTH
        );
      });
    });

    describe('schoolName updates', () => {
      it('should update sessionStorage', async () => {
        act(() => {
          hook.current.setSchoolName('Cool School');
        });

        waitFor(() => {
          const schoolNameSessionStorageCalls =
            mockSessionStorage.setItem.mock.calls.filter(
              ([key]) => key === SCHOOL_NAME_SESSION_KEY
            );
          expect(schoolNameSessionStorageCalls).toHaveLength(2);
          expect(schoolNameSessionStorageCalls[0][1]).toBe('');
          expect(schoolNameSessionStorageCalls[1][1]).toBe('Cool School');
        });
      });
    });
  });
});
