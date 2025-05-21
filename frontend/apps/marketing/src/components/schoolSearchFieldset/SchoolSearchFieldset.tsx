'use client';

import {useCallback, useEffect, useState} from 'react';

import {
  SimpleDropdown,
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';

import {getStudioUrl} from '@/config/studio';

const ZIP_LENGTH = 5;
const ZIP_REGEX = new RegExp(`(?!00000)\\d{${ZIP_LENGTH}}`);

type School = {
  nces_id: string;
  name: string;
};

export interface SchoolSearchFieldsetProps {
  required?: boolean;
  noSchoolId?: string;
  className?: string;
  onSelect: (schoolId: string, schoolName: string) => void;
}

const SchoolSearchFieldset: React.FC<SchoolSearchFieldsetProps> = ({
  required = false,
  noSchoolId,
  className,
  onSelect,
}) => {
  const [zipError, setZipError] = useState('');
  const [schoolZip, setSchoolZip] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState<
    SimpleDropdownProps['items']
  >([]);

  const resetSchoolData = () => {
    setSchoolOptions([]);
    selectSchool('');
  };

  const selectSchool = useCallback(
    (newSchoolId: string) => {
      setSchoolId(newSchoolId);

      const schoolName =
        schoolOptions?.find(option => option.value === newSchoolId)?.text || '';

      onSelect(newSchoolId, schoolName);
    },
    [onSelect, schoolOptions],
  );

  useEffect(() => {
    setZipError('');
  }, [schoolZip]);

  useEffect(() => {
    if (schoolZip && ZIP_REGEX.test(schoolZip)) {
      setSchoolsLoading(true);

      fetch(getStudioUrl(`/dashboardapi/v1/schoolzipsearch/${schoolZip}`))
        .then(async response => {
          if (response.ok) {
            return await response.json();
          } else {
            const errorText = await response.text();
            throw new Error(
              `Schools search failed with HTTP ${response.status} ${response.statusText}: ${errorText}`,
            );
          }
        })
        .then((schools: School[]) => {
          const schoolItems: SimpleDropdownProps['items'] =
            schools.map(({nces_id, name}) => ({value: nces_id, text: name})) ||
            [];

          if (noSchoolId) {
            schoolItems.unshift({
              value: noSchoolId,
              text: 'Other school not listed below',
            });
            selectSchool(noSchoolId);
          }

          setSchoolOptions(schoolItems);
        })
        .catch(error => {
          setZipError(
            typeof error === 'string'
              ? error
              : 'Something went wrong. Please try again later',
          );
          resetSchoolData();
        })
        .finally(() => {
          setSchoolsLoading(false);
        });
    } else {
      resetSchoolData();
    }
  }, [schoolZip]);

  return (
    <fieldset className={className}>
      <TextField
        required={required}
        inputType="text"
        name="schoolZip"
        label="Enter your school's zip code"
        maxLength={ZIP_LENGTH}
        pattern={ZIP_REGEX.source}
        value={schoolZip}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSchoolZip(e.target.value)
        }
        errorMessage={zipError}
      />

      <SimpleDropdown
        required={required}
        name="schoolId"
        labelText="Select your school from the list"
        value={schoolId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          selectSchool(e.target.value)
        }
        readOnly={!schoolOptions?.length}
        items={schoolOptions}
        iconLeft={
          schoolsLoading
            ? {iconName: 'spinner', animationType: 'spin'}
            : undefined
        }
      />
    </fieldset>
  );
};

export default SchoolSearchFieldset;
