import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';

import {
  CLICK_TO_ADD,
  NO_SCHOOL_SETTING,
  SCHOOL_COUNTRY,
  SELECT_A_SCHOOL,
  US_COUNTRY_CODE,
  ZIP_REGEX,
} from '../constants';
import {SchoolDropdownOption, SchoolInfoInitialState} from '../types';
import {constructSchoolOption} from '../utils/constructSchoolOption';
import {fetchSchools as fetchSchoolsAPI} from '../utils/fetchSchools';
import {sendAnalyticsEvent} from '../utils/sendAnalyticsEvent';

export function useSchoolInfo(initialState: SchoolInfoInitialState) {
  const mounted = useRef(false);

  // Memoized initial values
  const detectedCountry = useMemo(
    () =>
      initialState.country ??
      sessionStorage.getItem(SCHOOL_COUNTRY) ??
      (initialState.usIp ? US_COUNTRY_CODE : ''),
    [initialState.country, initialState.usIp]
  );

  const detectedSchoolId = useMemo(
    () =>
      initialState.schoolId ??
      sessionStorage.getItem(SCHOOL_ID_SESSION_KEY) ??
      SELECT_A_SCHOOL,
    [initialState.schoolId]
  );

  const detectedZip = useMemo(
    () =>
      initialState.schoolZip ??
      sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY) ??
      '',
    [initialState.schoolZip]
  );

  const detectedSchoolName = useMemo(
    () =>
      initialState.schoolName ??
      sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY) ??
      '',
    [initialState.schoolName]
  );

  // State hooks
  const [country, setCountry] = useState(detectedCountry);
  const [schoolId, setSchoolId] = useState(detectedSchoolId);
  const [schoolZip, setSchoolZip] = useState(detectedZip);
  const [schoolName, setSchoolName] = useState(detectedSchoolName);
  const [schoolsList, setSchoolsList] = useState<SchoolDropdownOption[]>([]);

  const schoolZipIsValid = useMemo(
    () => ZIP_REGEX.test(schoolZip),
    [schoolZip]
  );

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

  // Handle country changes
  useEffect(() => {
    sessionStorage.setItem(SCHOOL_COUNTRY, country);

    if (mounted.current && country) {
      setSchoolId(SELECT_A_SCHOOL);
      setSchoolZip('');
      setSchoolName('');
      setSchoolsList([]);
      sendAnalyticsEvent(EVENTS.COUNTRY_SELECTED, {country});
    }
  }, [country]);

  // Handle schoolZip changes
  useEffect(() => {
    if (!mounted.current || !schoolZip || !schoolZipIsValid) return;

    sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, schoolZip);

    setSchoolId(SELECT_A_SCHOOL);
    setSchoolName('');
    setSchoolsList([]);

    sendAnalyticsEvent(EVENTS.ZIP_CODE_ENTERED, {zip: schoolZip});

    fetchSchools(schoolZip, data => {
      if (!mounted.current) return;

      const schools = data
        .map(constructSchoolOption)
        .sort((a, b) => a.text.localeCompare(b.text));
      setSchoolsList(schools);

      if (schools.some(school => school.value === detectedSchoolId)) {
        setSchoolId(detectedSchoolId);
      }
    });
  }, [schoolZip, schoolZipIsValid, detectedSchoolId, fetchSchools]);

  // Handle schoolId changes
  useEffect(() => {
    sessionStorage.setItem(SCHOOL_ID_SESSION_KEY, schoolId);
    if (mounted.current) {
      if (schoolId === NO_SCHOOL_SETTING) {
        sendAnalyticsEvent(EVENTS.DO_NOT_TEACH_AT_SCHOOL_CLICKED, {});
      } else if (schoolId === CLICK_TO_ADD) {
        sendAnalyticsEvent(EVENTS.ADD_MANUALLY_CLICKED, {});
      } else {
        sendAnalyticsEvent(EVENTS.SCHOOL_SELECTED_FROM_LIST, {
          'nces Id': schoolId,
        });
      }
    }
  }, [schoolId]);

  // Handle schoolName changes
  useEffect(() => {
    sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, schoolName);
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
    schoolZipIsValid,
    setSchoolId,
    setCountry,
    setSchoolName,
    setSchoolZip,
  };
}
