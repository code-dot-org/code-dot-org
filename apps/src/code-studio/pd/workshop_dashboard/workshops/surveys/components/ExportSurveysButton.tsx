import Alert from '@code-dot-org/component-library/alert';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import styles from './ExportSurveysButton.module.scss';
import commonStyles from '../../WorkshopLayout.module.scss';

export const ExportSurveysButton = () => {
  const {workshopId} = useParams<{workshopId: string}>();
  const [formsDialogOpen, setFormsDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const {data: forms, loading} = useFetch<
    {name: string; version: string}[] | null
  >(
    workshopId
      ? `/api/v1/pd/workshops/${workshopId}/foorm/forms_for_workshop`
      : ''
  );

  const handleClose = () => {
    setFormsDialogOpen(false);
    setError('');
  };

  const handleDownload = async (form: {name: string; version: string}) => {
    setError('');
    if (!workshopId) {
      setError('Workshop not found.');
      return;
    }
    try {
      const url = `/api/v1/pd/workshops/${workshopId}/foorm/csv_survey_report?name=${encodeURIComponent(
        form.name
      )}&version=${encodeURIComponent(form.version)}`;
      const response = await fetch(url, {method: 'GET'});
      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Failed to download the CSV.');
        return;
      }
      window.open(url);
    } catch (error) {
      setError('An unknown error occurred. Please try again.');
    }
  };

  return (
    <>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        disabled={!workshopId || !forms?.length}
        loadingPosition="start"
        loading={loading}
        className={styles.exportButton}
        onClick={() => setFormsDialogOpen(true)}
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="download" />}
      >
        {'Export survey results'}
      </MuiButton>
      {formsDialogOpen && (
        <CustomDialog
          className={commonStyles.customDialog}
          onClose={handleClose}
          aria-labelledby="export-survey-dialog-title"
        >
          <div
            id="dsco-dialog-description"
            className={commonStyles.customDialogContent}
          >
            <Typography
              id="export-survey-dialog-title"
              component="p"
              variant="h4"
            >
              Export Survey Results
            </Typography>
            <table>
              <tbody>
                {(forms ?? []).map(form => {
                  const formNameArray = form.name.split('/');
                  const formName = formNameArray[formNameArray.length - 1];
                  return (
                    <tr key={`${form.name}_${form.version}`}>
                      <td>
                        <Typography variant="body2">{formName}</Typography>
                      </td>
                      <td>
                        <Typography variant="body2">
                          {`Version: ${form.version}`}
                        </Typography>
                      </td>
                      <td>
                        <MuiButton
                          variant="contained"
                          color="primary"
                          size="extraSmall"
                          onClick={() => {
                            handleDownload(form);
                          }}
                          type="button"
                        >
                          {'Download csv'}
                        </MuiButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {error && (
              <Alert
                type="danger"
                text={error}
                className={commonStyles.customDialogError}
              />
            )}
          </div>
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="medium"
            onClick={handleClose}
            type="button"
          >
            {'Close'}
          </MuiButton>
        </CustomDialog>
      )}
    </>
  );
};
