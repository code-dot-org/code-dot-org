import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  SCHOOL_COUNTRY_SESSION_KEY,
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
  ZIP_REGEX,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

import {SchoolDropdownOption, SchoolInfoInitialState} from '../types';
import {constructSchoolOption} from '../utils/constructSchoolOption';
import {fetchSchools as fetchSchoolsAPI} from '../utils/fetchSchools';

export function useSchoolInfo(initialState: SchoolInfoInitialState) {
  const mounted = useRef(false);

  // Memoized initial values
  const detectedCountry = useMemo(
    () =>
      initialState.country ||
      sessionStorage.getItem(SCHOOL_COUNTRY_SESSION_KEY) ||
      (initialState.usIp ? US_COUNTRY_CODE : SELECT_COUNTRY),
    [initialState.country, initialState.usIp]
  );

  const detectedSchoolId = useMemo(() => {
    if (initialState.schoolType === NonSchoolOptions.NO_SCHOOL_SETTING) {
      return NonSchoolOptions.NO_SCHOOL_SETTING;
    }
    if (
      !initialState.schoolId &&
      initialState.schoolName &&
      initialState.schoolZip
    ) {
      return NonSchoolOptions.CLICK_TO_ADD;
    }
    return (
      initialState.schoolId ||
      sessionStorage.getItem(SCHOOL_ID_SESSION_KEY) ||
      NonSchoolOptions.SELECT_A_SCHOOL
    );
  }, [
    initialState.schoolId,
    initialState.schoolType,
    initialState.schoolName,
    initialState.schoolZip,
  ]);

  const detectedZip = useMemo(
    () =>
      initialState.schoolZip ||
      sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY) ||
      '',
    [initialState.schoolZip]
  );

  const detectedSchoolName = useMemo(
    () =>
      initialState.schoolName ||
      sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY) ||
      '',
    [initialState.schoolName]
  );

  const [state, setState] = useState<{
    country: string;
    schoolId: string;
    schoolZip: string;
    schoolName: string;
  }>({
    country: detectedCountry,
    schoolId: detectedSchoolId,
    schoolZip: detectedZip,
    schoolName: detectedSchoolName,
  });
  const [schoolsList, setSchoolsList] = useState<SchoolDropdownOption[]>([]);

  // State hooks
  const setCountry = (value: string) => {
    setState(prevState => ({
      ...prevState,
      country: value,
    }));
  };
  const setSchoolId = (value: string) => {
    setState(prevState => ({
      ...prevState,
      schoolId: value,
    }));
  };
  const setSchoolZip = (value: string) => {
    setState(prevState => ({
      ...prevState,
      schoolZip: value,
    }));
  };
  const setSchoolName = (value: string) => {
    setState(prevState => ({
      ...prevState,
      schoolName: value,
    }));
  };

  const reset = () => {
    setState({
      country: detectedCountry,
      schoolId: detectedSchoolId,
      schoolZip: detectedZip,
      schoolName: detectedSchoolName,
    });
  };

  // Memoized fetchSchools function using useCallback
  const fetchSchools = useCallback(
    (
      zip: string,
      callback: (data: {nces_id: number; name: string}[]) => void
    ) => {
      fetchSchoolsAPI(zip, callback);
    },
    []
  );

  const handleSessionStorage = (
    key: string,
    value: string,
    callback?: () => void
  ) => {
    if (sessionStorage.getItem(key) !== value) {
      sessionStorage.setItem(key, value);
      if (callback) {
        callback();
      }
    }
  };

  const {country, schoolId, schoolZip, schoolName} = state;

  // Handle country changes
  useEffect(() => {
    handleSessionStorage(SCHOOL_COUNTRY_SESSION_KEY, country, () => {
      analyticsReporter.sendEvent(
        EVENTS.COUNTRY_SELECTED,
        {country},
        PLATFORMS.BOTH
      );
    });
  }, [country]);

  // Handle schoolZip changes
  useEffect(() => {
    if (!ZIP_REGEX.test(schoolZip)) {
      handleSessionStorage(SCHOOL_ZIP_SESSION_KEY, '');
      setSchoolsList([]);
      return;
    }

    handleSessionStorage(SCHOOL_ZIP_SESSION_KEY, schoolZip, () => {
      analyticsReporter.sendEvent(
        EVENTS.ZIP_CODE_ENTERED,
        {zip: schoolZip},
        PLATFORMS.BOTH
      );
    });

    fetchSchools(schoolZip, data => {
      if (!mounted.current) return;

      const schools = data
        .map(constructSchoolOption)
        .sort((a, b) => a.text.localeCompare(b.text));

      setSchoolsList(schools);

      // this will auto select the school from the fetched list of schools if the user is updating their school info
      if (schools.some(school => school.value === detectedSchoolId)) {
        setSchoolId(detectedSchoolId);
      }
    });
  }, [schoolZip, detectedSchoolId, fetchSchools]);

  // Handle schoolId changes
  useEffect(() => {
    handleSessionStorage(SCHOOL_ID_SESSION_KEY, schoolId, () => {
      if (schoolId === NonSchoolOptions.NO_SCHOOL_SETTING) {
        setSchoolName('');
        analyticsReporter.sendEvent(
          EVENTS.DO_NOT_TEACH_AT_SCHOOL_CLICKED,
          {},
          PLATFORMS.BOTH
        );
      } else if (schoolId === NonSchoolOptions.CLICK_TO_ADD) {
        setSchoolName('');
        analyticsReporter.sendEvent(
          EVENTS.ADD_MANUALLY_CLICKED,
          {},
          PLATFORMS.BOTH
        );
      } else {
        const name = schoolsList.find(
          school => school.value === schoolId
        )?.text;
        if (name) {
          setSchoolName(name);
        }
        analyticsReporter.sendEvent(
          EVENTS.SCHOOL_SELECTED_FROM_LIST,
          {
            'nces Id': schoolId,
          },
          PLATFORMS.BOTH
        );
      }
    });
  }, [schoolId, schoolsList]);

  // Handle schoolName changes
  useEffect(() => {
    handleSessionStorage(SCHOOL_NAME_SESSION_KEY, schoolName);
  }, [schoolName]);

  // Manage mounted state
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    schoolId,
    country,
    schoolName,
    schoolZip,
    schoolsList,
    usIp: initialState.usIp,
    setSchoolId,
    setCountry,
    setSchoolName,
    setSchoolZip,
    reset,
  };
}
