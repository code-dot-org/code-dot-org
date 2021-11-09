import {useCallback, useEffect, useState} from 'react';
import $ from 'jquery';
import {
  PROGRAM_CSD,
  PROGRAM_CSP,
  PROGRAM_CSA
} from '../application/teacher/TeacherApplicationConstants';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {debounce} from 'lodash';

const COURSE_NAMES = {
  [PROGRAM_CSD]: 'CS Discoveries',
  [PROGRAM_CSP]: 'CS Principles',
  [PROGRAM_CSA]: 'Computer Science A'
};

// constructs query params and fetches the data, returning a promise
const fetchRegionalPartner = ({
  program,
  schoolZipCode,
  schoolState,
  school
}) => {
  const locationParams = {
    course: COURSE_NAMES[program],
    subject: SubjectNames.SUBJECT_SUMMER_WORKSHOP
  };
  if (school === '-1') {
    locationParams.zip_code = schoolZipCode;
    locationParams.state = schoolState;
  } else if (school) {
    locationParams.school = school;
  } else {
    return Promise.reject('parameter error');
  }

  const url = `/api/v1/pd/regional_partner_workshops/find?${$.param(
    locationParams
  )}`;

  return fetch(url).then(response => {
    if (!response.ok) {
      throw response.statusText;
    }
    return response.json();
  });
};

// takes {program, school, schoolZipCode, schoolState}
// returns undefined if loading or null if error, otherwise: {id, name, group, workshops, has_csf, pl_programs_offered}
// if the request succeeds but regional partner is not found, the returned rp will have nil for all values
// see regional_partner_workshops_serializer.rb
export const useRegionalPartner = data => {
  const {program, schoolZipCode, schoolState, school} = data;
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [partner, setPartner] = useState(null);
  // cache this debounced function so that it is more easily testable
  const debouncedFetch = useCallback(
    debounce(fetchRegionalPartner, 500, {leading: true}),
    []
  );

  // load regional partner whenever parameters change
  useEffect(() => {
    let cancelled = false;
    debouncedFetch(data)
      .then(partner => {
        if (!cancelled) {
          // Update state with all the partner workshop data to display
          setLoadingPartner(false);
          setLoadError(false);
          // the api returns an object with all fields set to null if not found
          setPartner(partner.id === null ? null : partner);
        }
      })
      .catch(() => {
        setLoadingPartner(false);
        setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [program, schoolZipCode, schoolState, school]);

  return [loadingPartner ? undefined : partner, loadError];
};
