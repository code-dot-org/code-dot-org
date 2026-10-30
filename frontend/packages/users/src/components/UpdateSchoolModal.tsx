import {Box, Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Field, FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useSchoolZipSearch,
  useUpdateSchoolInfo,
  type SchoolInfoSummary,
} from '@code-dot-org/core/api';

import {COUNTRIES_US_FIRST} from '../util/countries';
import {
  CLICK_TO_ADD,
  SELECT_A_SCHOOL,
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
  ZIP,
  schoolInfoInvalid,
} from '../util/schoolInfo';

import FormDialog from './FormDialog';
import styles from './UpdateSchoolModal.module.css';
import {useModalForm} from './useModalForm';

const ZIP_INVALID = 'Please enter a 5 digit zip code.';
const NO_SCHOOLS = 'No schools found for that zip code.';

/**
 * Finds and saves a new school affiliation. Only the country carries over from
 * the record on file: the point of the dialog is to pick a different school.
 */
export default function UpdateSchoolModal({
  open,
  onClose,
  schoolInfo,
}: {
  open: boolean;
  onClose: () => void;
  schoolInfo?: SchoolInfoSummary | null;
}) {
  const mutation = useUpdateSchoolInfo(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [country, setCountry] = useState(schoolInfo?.country ?? SELECT_COUNTRY);
  const [schoolZip, setSchoolZip] = useState('');
  const [schoolId, setSchoolId] = useState(SELECT_A_SCHOOL);
  const [schoolName, setSchoolName] = useState('');

  const isUs = country === US_COUNTRY_CODE;
  const addingManually = schoolId === CLICK_TO_ADD;
  const zipValid = ZIP.test(schoolZip);

  // Outside the US there is no zip to search on; the hook idles on a non-zip.
  const search = useSchoolZipSearch(DashboardApiClient, isUs ? schoolZip : '');
  const schoolsList = [...(search.data ?? [])]
    .map(school => ({value: school.ncesId, text: school.name}))
    .sort((a, b) => a.text.localeCompare(b.text));

  const saving = mutation.isPending;
  const canSubmit =
    !saving &&
    !schoolInfoInvalid({schoolId, country, schoolName, schoolZip, schoolsList});

  // Read on open only, so a background settings refetch can't move the country
  // out from under the user mid-edit.
  const latestCountry = useRef(schoolInfo?.country);
  latestCountry.current = schoolInfo?.country;

  useEffect(() => {
    if (!open) return;
    setCountry(latestCountry.current ?? SELECT_COUNTRY);
    setSchoolZip('');
    setSchoolId(SELECT_A_SCHOOL);
    setSchoolName('');
  }, [open]);

  const close = () => {
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    if (!canSubmit) return;
    await mutation.mutateAsync({schoolId, country, schoolName, schoolZip});
    toast('School information updated.');
    close();
  });

  // Wrapped in a Field to stretch to the column: nested inside .schoolList it is
  // no longer a direct child of the dialog content, and a bare DSCO control is a
  // fixed 300px — wider than a phone-width dialog.
  const schoolNameField = (
    <Field>
      <TextField
        label="What is the school/organization name?"
        name="school_name"
        value={schoolName}
        onChange={event => setSchoolName(event.target.value)}
        disabled={saving}
      />
    </Field>
  );

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="update-school-title"
      title="Update your school information"
      describedById="update-school-desc"
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            Update my school
          </Button>
        </>
      }
    >
      <Typography id="update-school-desc" variant="body2">
        Find your new school using the fields below. You’ll be able to update
        this information at any time in your account settings.
      </Typography>
      <FormError message={errors.formError} />

      <SimpleDropdown
        name="country"
        labelText="What country are you located in?"
        items={COUNTRIES_US_FIRST}
        selectedValue={country}
        onChange={event => setCountry(event.target.value)}
        disabled={saving}
        styleAsFormField
      />

      {isUs && (
        <TextField
          label="Enter your school's zip code:"
          name="school_zip"
          value={schoolZip}
          onChange={event => setSchoolZip(event.target.value)}
          errorMessage={schoolZip && !zipValid ? ZIP_INVALID : undefined}
          disabled={saving}
          autoComplete="postal-code"
        />
      )}

      {isUs && !addingManually && (
        <Box className={styles.schoolList}>
          <Field>
            <SimpleDropdown
              name="school_id"
              labelText="Select your school from the list"
              items={[
                {value: SELECT_A_SCHOOL, text: 'Select a school'},
                ...schoolsList,
              ]}
              selectedValue={schoolId}
              onChange={event => setSchoolId(event.target.value)}
              helperMessage={
                zipValid && search.isSuccess && schoolsList.length === 0
                  ? NO_SCHOOLS
                  : undefined
              }
              disabled={saving || !zipValid || search.isFetching}
              styleAsFormField
            />
          </Field>
          <Button onClick={() => setSchoolId(CLICK_TO_ADD)} sx={{px: 0}}>
            I don’t see my school here. Add manually
          </Button>
        </Box>
      )}

      {isUs && addingManually && (
        <Box className={styles.schoolList}>
          {schoolNameField}
          <Button onClick={() => setSchoolId(SELECT_A_SCHOOL)} sx={{px: 0}}>
            Return to results list
          </Button>
        </Box>
      )}

      {/* Outside the US there is no NCES list to search, so the name is typed. */}
      {!isUs && country !== SELECT_COUNTRY && schoolNameField}
    </FormDialog>
  );
}
