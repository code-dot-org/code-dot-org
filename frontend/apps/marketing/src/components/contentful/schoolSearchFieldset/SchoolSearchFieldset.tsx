'use client';

import {useCallback, useEffect, useState, useMemo} from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';

import {getStudioUrl} from '@/config/studio';

const ZIP_LENGTH = 5;
const ZIP_REGEX = new RegExp(`(?!00000)\\d{${ZIP_LENGTH}}`);

export type School = {
  nces_id: string;
  name: string;
  zip?: string;
  city?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  school_type?: string;
};

export interface SchoolSearchFieldsetProps {
  required?: boolean;
  school?: School | null;
  noSchoolId?: string;
  className?: string;
  onSelect: (school: School | null) => void;
}

const SchoolSearchFieldset: React.FC<SchoolSearchFieldsetProps> = ({
  required = false,
  school,
  noSchoolId = '',
  className,
  onSelect,
}) => {
  const defaultSchoolZip = '';
  const defaultSchoolZipError = '';
  const defaultSchoolId = '';
  const defaultSchools = null;

  const [schoolZip, setSchoolZip] = useState(defaultSchoolZip);
  const [zipError, setZipError] = useState(defaultSchoolZipError);
  const [schoolId, setSchoolId] = useState(defaultSchoolId);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schools, setSchools] = useState<School[] | null>(defaultSchools);

  const selectSchool = useCallback(
    (selectedSchoolId: School['nces_id']) => {
      setSchoolId(selectedSchoolId);
      onSelect(
        schools?.find(({nces_id}) => nces_id === selectedSchoolId) || null,
      );
    },
    [onSelect, schools],
  );

  const fetchSchools = useCallback((zipCode: string) => {
    if (zipCode && ZIP_REGEX.test(zipCode)) {
      setSchoolsLoading(true);

      fetch(getStudioUrl(`/dashboardapi/v1/schoolzipsearch/${zipCode}`))
        .then(async response => {
          if (response.ok) {
            return await response.json();
          } else {
            const errorText = await response.text();
            throw `Schools search failed with HTTP ${response.status} ${response.statusText}: ${errorText}`;
          }
        })
        .then((schools: School[]) => {
          setSchools(schools);
        })
        .catch(error => {
          setZipError(
            typeof error === 'string'
              ? error
              : 'Something went wrong. Please try again later',
          );
        })
        .finally(() => {
          setSchoolsLoading(false);
        });
    }
  }, []);

  const getSchoolOptionText = useCallback(
    (school: School) =>
      [school.name, [school.city, school.state].filter(Boolean).join(', ')]
        .filter(Boolean)
        .join(' - '),
    [],
  );

  const schoolOptions = useMemo(() => {
    const schoolOptions: SimpleDropdownProps['items'] = [];

    if (schools) {
      schoolOptions.push({
        value: noSchoolId,
        text: 'Other school not listed below',
      });

      schools.forEach(school => {
        schoolOptions.push({
          value: school.nces_id,
          text: getSchoolOptionText(school),
        });
      });
    }

    return schoolOptions;
  }, [schools, noSchoolId]);

  useEffect(() => {
    setSchoolZip(school?.zip || defaultSchoolZip);
    setSchoolId(school?.nces_id || defaultSchoolId);
  }, [school]);

  useEffect(() => {
    setZipError(defaultSchoolZipError);
    setSchools(defaultSchools);
    fetchSchools(schoolZip);
  }, [schoolZip]);

  return (
    <fieldset className={className}>
      <TextField
        required={required && !school}
        inputType="text"
        name="schoolZip"
        label="Enter your school's zip code"
        maxLength={ZIP_LENGTH}
        pattern={ZIP_REGEX.source}
        value={schoolZip}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          selectSchool(defaultSchoolId);
          setSchoolZip(e.target.value);
        }}
        errorMessage={zipError}
      />

      {school && !schoolOptions.length ? (
        <TextField
          readOnly
          required={required}
          inputType="text"
          name="schoolName"
          label="School name"
          value={getSchoolOptionText(school)}
          onChange={() => {}}
        />
      ) : (
        <SimpleDropdown
          required={required}
          name="schoolId"
          labelText="Select your school from the list"
          value={schoolId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            selectSchool(e.target.value)
          }
          readOnly={!schoolOptions.length}
          items={schoolOptions}
          iconLeft={
            schoolsLoading
              ? {iconName: 'spinner', animationType: 'spin'}
              : undefined
          }
        />
      )}
    </fieldset>
  );
};

export default SchoolSearchFieldset;
