import {useEffect, useMemo, useRef, useState} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {
  CLICK_TO_ADD,
  NO_SCHOOL_SETTING,
  SCHOOL_COUNTRY,
  SCHOOL_ZIP_SEARCH as SCHOOL_ZIP_SEARCH_URL,
  SELECT_A_SCHOOL,
  US_COUNTRY_CODE,
  ZIP_REGEX,
} from '../constants';

export interface SchoolInfoInitialState {
  schoolId?: string;
  country?: string;
  schoolName?: string;
  schoolZip?: string;
  usIp?: boolean;
}

export interface SchoolDropdownOption {
  value: string;
  text: string;
}

export interface SchoolInfoRequestWithSchoolId {
  school_id: string;
}

export interface SchoolInfoRequestWithoutSchoolId {
  country: string;
  school_name?: string;
  zip?: string;
}

export interface SchoolInfoAttributes {
  school_info_attributes:
    | SchoolInfoRequestWithSchoolId
    | SchoolInfoRequestWithoutSchoolId;
}

export interface SchoolInfoRequest {
  user: SchoolInfoAttributes;
}

export function sendAnalyticsEvent(
  eventName: string,
  data: Record<string, string>
) {
  analyticsReporter.sendEvent(eventName, data, PLATFORMS.BOTH);
}

export function constructSchoolOption(school: {
  nces_id: number;
  name: string;
}): SchoolDropdownOption {
  return {
    value: school.nces_id.toString(),
    text: `${school.name}`,
  };
}

export function buildSchoolData({
  schoolId,
  country,
  schoolName,
  schoolZip,
}: {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
}): SchoolInfoRequest | undefined {
  // If we have an NCES id, _only_ send that - everything else will be
  // backfilled by records on the server.
  if (
    schoolId &&
    ![NO_SCHOOL_SETTING, CLICK_TO_ADD, SELECT_A_SCHOOL].includes(schoolId)
  ) {
    return {
      user: {
        school_info_attributes: {
          school_id: schoolId,
        },
      },
    };
  }

  if (country) {
    return {
      user: {
        school_info_attributes: {
          country,
          school_name: schoolName,
          zip: country === US_COUNTRY_CODE ? schoolZip : undefined,
        },
      },
    };
  }
}

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

  const updateSchoolInfo = async ({
    formUrl,
    authTokenName,
    authTokenValue,
  }: {
    formUrl: string;
    authTokenName: string;
    authTokenValue: string;
  }) => {
    const schoolData = buildSchoolData({
      schoolId,
      country,
      schoolName,
      schoolZip,
    });
    if (!schoolData) {
      return;
    }
    const response = await fetch(formUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({
        _method: 'patch',
        [authTokenName]: authTokenValue,
        ...schoolData,
      }),
    });

    if (!response.ok) {
      throw new Error('School info update failed');
    }
  };

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
    updateSchoolInfo,
  };
}
