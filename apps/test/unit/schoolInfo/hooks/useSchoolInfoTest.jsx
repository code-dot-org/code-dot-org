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
  let mockFetch;
  let sendAnalyticsEventSpy;

  const initialState = {
    country: US_COUNTRY_CODE,
    schoolId: '1',
    schoolName: 'Cool School',
    schoolZip: '00000',
  };

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        {nces_id: '1', name: 'Cool School'},
        {nces_id: '2', name: 'Other School'},
      ]),
    };
    mockFetch = jest.fn().mockResolvedValue(mockResponse);
    window.fetch = mockFetch;

    sendAnalyticsEventSpy = jest.spyOn(
      require('@cdo/apps/lib/util/AnalyticsReporter'),
      'sendEvent'
    );
  });

  it('should use initialState instead of sessionStorage if passed', async () => {
    sessionStorage.setItem(SCHOOL_COUNTRY_SESSION_KEY, 'CA');
    sessionStorage.setItem(SCHOOL_ID_SESSION_KEY, '');
    sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, 'Stored School');
    sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, '');

    const {result, waitForNextUpdate} = renderHook(() =>
      useSchoolInfo(initialState)
    );

    // initial state has a valid zip code, so next update must be awaited while schools are fetched
    await waitForNextUpdate();

    expect(result.current.country).toBe(initialState.country);
    expect(result.current.schoolId).toBe(initialState.schoolId);
    expect(result.current.schoolName).toBe(initialState.schoolName);
    expect(result.current.schoolZip).toBe(initialState.schoolZip);
  });

  it('should use sessionStorage if no initialState is passed', () => {
    sessionStorage.setItem(SCHOOL_COUNTRY_SESSION_KEY, 'CA');
    sessionStorage.setItem(SCHOOL_ID_SESSION_KEY, '');
    sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, 'Stored School');
    sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, '');

    const {result} = renderHook(() => useSchoolInfo({}));

    // sessionStorage state does not have a valid zip code, so no need to await anything

    expect(result.current.country).toBe('CA');
    expect(result.current.schoolId).toBe(SELECT_A_SCHOOL);
    expect(result.current.schoolName).toBe('Stored School');
    expect(result.current.schoolZip).toBe('');
  });

  describe('hook state updates', () => {
    let hook;
    beforeEach(async () => {
      const {result, waitForNextUpdate} = renderHook(() =>
        useSchoolInfo(initialState)
      );

      hook = result;

      await waitForNextUpdate(); // Wait for initial render
    });

    describe('country updates', () => {
      it('should update sessionStorage', () => {
        act(() => {
          hook.current.setCountry('CA');
        });

        const schoolCountrySessionStorageCalls =
          mockSessionStorage.setItem.mock.calls.filter(
            ([key]) => key === SCHOOL_COUNTRY_SESSION_KEY
          );

        expect(schoolCountrySessionStorageCalls).toHaveLength(2);
        expect(schoolCountrySessionStorageCalls[0][1]).toBe(
          initialState.country
        );
        expect(schoolCountrySessionStorageCalls[1][1]).toBe('CA');
      });

      it('should retain schoolZip, schoolId, and schoolName on country changes', () => {
        expect(hook.current.country).toBe(initialState.country);
        expect(hook.current.schoolId).toBe(initialState.schoolId);
        expect(hook.current.schoolZip).toBe(initialState.schoolZip);
        expect(hook.current.schoolName).toBe(initialState.schoolName);
        expect(hook.current.schoolsList).toEqual([
          {value: initialState.schoolId, text: initialState.schoolName},
          {value: '2', text: 'Other School'},
        ]);

        act(() => {
          hook.current.setCountry('CA');
        });

        expect(hook.current.country).toBe('CA');
        expect(hook.current.schoolId).toBe(initialState.schoolId);
        expect(hook.current.schoolZip).toBe(initialState.schoolZip);
        expect(hook.current.schoolName).toBe(initialState.schoolName);
        expect(hook.current.schoolsList).toEqual([
          {value: initialState.schoolId, text: initialState.schoolName},
          {value: '2', text: 'Other School'},
        ]);
      });

      it('should send an analytics event', () => {
        act(() => {
          hook.current.setCountry('CA');
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.COUNTRY_SELECTED,
          {country: 'CA'},
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

        const schoolZipSessionStorageCalls =
          mockSessionStorage.setItem.mock.calls.filter(
            ([key]) => key === SCHOOL_ZIP_SESSION_KEY
          );
        expect(schoolZipSessionStorageCalls).toHaveLength(2);
        expect(schoolZipSessionStorageCalls[0][1]).toBe(initialState.schoolZip);
        expect(schoolZipSessionStorageCalls[1][1]).toBe('90210');
      });

      it('should clear sessionStorage schoolZip if zip is invalid', () => {
        // invalid zip clears session storage
        // doesn't fetch schools so not async
        act(() => {
          hook.current.setSchoolZip('BADZIP');
        });

        const schoolZipSessionStorageCalls =
          mockSessionStorage.setItem.mock.calls.filter(
            ([key]) => key === SCHOOL_ZIP_SESSION_KEY
          );
        expect(schoolZipSessionStorageCalls).toHaveLength(2);
        expect(schoolZipSessionStorageCalls[0][1]).toBe(initialState.schoolZip);
        expect(schoolZipSessionStorageCalls[1][1]).toBe('');
      });

      it('should retain schoolId and schoolName if the schoolZip changes', async () => {
        expect(hook.current.schoolId).toBe(initialState.schoolId);
        expect(hook.current.schoolName).toBe(initialState.schoolName);
        expect(hook.current.schoolsList).toEqual([
          {value: initialState.schoolId, text: initialState.schoolName},
          {value: '2', text: 'Other School'},
        ]);

        await act(async () => {
          hook.current.setSchoolZip('90210');
        });

        expect(hook.current.schoolZip).toBe('90210');
        expect(hook.current.schoolId).toBe(initialState.schoolId);
        expect(hook.current.schoolName).toBe(initialState.schoolName);
        expect(hook.current.schoolsList).toEqual([
          {value: initialState.schoolId, text: initialState.schoolName},
          {value: '2', text: 'Other School'},
        ]);
      });
    });

    it('should send an analytics event', async () => {
      await act(async () => {
        hook.current.setSchoolZip('90210');
      });

      expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
        EVENTS.ZIP_CODE_ENTERED,
        {zip: '90210'},
        PLATFORMS.BOTH
      );
    });

    it('should fetch schools', async () => {
      await act(async () => {
        hook.current.setSchoolZip('90210');
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[0][0]).toEqual(
        expect.stringMatching(initialState.schoolZip)
      );
      expect(mockFetch.mock.calls[1][0]).toEqual(
        expect.stringMatching('90210')
      );
    });

    describe('schoolId updates', () => {
      it('should update sessionStorage', () => {
        act(() => {
          hook.current.setSchoolId('ABC123');
        });

        const schoolIdSessionStorageCalls =
          mockSessionStorage.setItem.mock.calls.filter(
            ([key]) => key === SCHOOL_ID_SESSION_KEY
          );
        expect(schoolIdSessionStorageCalls).toHaveLength(2);
        expect(schoolIdSessionStorageCalls[0][1]).toBe(initialState.schoolId);
        expect(schoolIdSessionStorageCalls[1][1]).toBe('ABC123');
      });

      it('should send analytics events', () => {
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
          hook.current.setSchoolId('2');
        });

        expect(sendAnalyticsEventSpy).toHaveBeenCalledWith(
          EVENTS.SCHOOL_SELECTED_FROM_LIST,
          {'nces Id': '2'},
          PLATFORMS.BOTH
        );
      });
    });

    describe('schoolName updates', () => {
      it('should update sessionStorage', async () => {
        act(() => {
          hook.current.setSchoolName('Super Cool School');
        });

        const schoolNameSessionStorageCalls =
          mockSessionStorage.setItem.mock.calls.filter(
            ([key]) => key === SCHOOL_NAME_SESSION_KEY
          );
        expect(schoolNameSessionStorageCalls).toHaveLength(2);
        expect(schoolNameSessionStorageCalls[0][1]).toBe(
          initialState.schoolName
        );
        expect(schoolNameSessionStorageCalls[1][1]).toBe('Super Cool School');
      });
    });
  });
});
