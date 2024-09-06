import {useEffect, useMemo, useRef, useState} from 'react';

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
import {fetchSchools} from '../utils/fetchSchools';
import {sendAnalyticsEvent} from '../utils/sendAnalyticsEvent';

export function useSchoolInfo(initialState: SchoolInfoInitialState) {
  const mounted = useRef(false);
  // If the user filled out country before or we are detecting a US IP address
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

  const [country, setCountry] = useState(detectedCountry);
  const [schoolId, setSchoolId] = useState(detectedSchoolId);
  const [schoolZip, setSchoolZip] = useState(detectedZip);
  const [schoolName, setSchoolName] = useState(detectedSchoolName);
  const [schoolsList, setSchoolsList] = useState<SchoolDropdownOption[]>([]);

  useEffect(() => {
    sessionStorage.setItem(SCHOOL_COUNTRY, country);
    if (mounted.current) {
      setSchoolId('');
      setSchoolZip('');
      setSchoolName('');
      setSchoolsList([]);
      analyticsReporter.sendEvent(
        EVENTS.COUNTRY_SELECTED,
        {country: country},
        PLATFORMS.BOTH
      );
    }
  }, [country]);

  useEffect(() => {
    sessionStorage.setItem(SCHOOL_NAME_SESSION_KEY, schoolName);
  }, [schoolName]);

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

  const schoolZipIsValid = useMemo(
    () => ZIP_REGEX.test(schoolZip),
    [schoolZip]
  );

  useEffect(() => {
    if (mounted.current) {
      setSchoolId('');
      setSchoolName('');
      setSchoolsList([]);
    }
    if (!schoolZipIsValid) {
      return;
    }

    const fetchSchools = async (zip: string) => {
      try {
        const searchUrl = `${SCHOOL_ZIP_SEARCH_URL}${zip}`;
        const response = await fetch(searchUrl, {
          headers: {'X-Requested-With': 'XMLHttpRequest'},
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const schools: SchoolDropdownOption[] = data.map(constructSchoolOption);

        if (schools.some(school => school.value === detectedSchoolId)) {
          setSchoolId(detectedSchoolId);
        }

        setSchoolsList(
          schools.sort((a: SchoolDropdownOption, b: SchoolDropdownOption) =>
            a.text > b.text ? 1 : -1
          )
        );
      } catch (error) {
        console.log('There was a problem with the fetch operation:', error);
      }
    };

    if (schoolZip !== sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY)) {
      // Clear out school from dropdown if schoolZip has changed
      setSchoolId(SELECT_A_SCHOOL);
      sessionStorage.setItem(SCHOOL_ZIP_SESSION_KEY, schoolZip);
    }

    sendAnalyticsEvent(EVENTS.ZIP_CODE_ENTERED, {zip: schoolZip});

    fetchSchools(schoolZip);
  }, [schoolZip, schoolZipIsValid, detectedSchoolId]);

  useEffect(() => {
    mounted.current = true;
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
