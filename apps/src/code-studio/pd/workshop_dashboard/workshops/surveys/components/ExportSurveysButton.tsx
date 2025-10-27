import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {
  BodyOneText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
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
      <Button
        className={styles.exportButton}
        iconLeft={
          loading
            ? {iconName: 'spinner', animationType: 'spin'}
            : {iconName: 'download'}
        }
        onClick={() => setFormsDialogOpen(true)}
        disabled={!workshopId || !forms?.length}
        text="Export survey results"
        size="s"
      />
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
            <BodyOneText
              id="export-survey-dialog-title"
              visualAppearance="heading-md"
              noMargin
            >
              Export Survey Results
            </BodyOneText>
            <table>
              <tbody>
                {(forms ?? []).map(form => {
                  const formNameArray = form.name.split('/');
                  const formName = formNameArray[formNameArray.length - 1];
                  return (
                    <tr key={`${form.name}_${form.version}`}>
                      <td>
                        <BodyTwoText noMargin>{formName}</BodyTwoText>
                      </td>
                      <td>
                        <BodyTwoText noMargin>
                          {`Version: ${form.version}`}
                        </BodyTwoText>
                      </td>
                      <td>
                        <Button
                          size="xs"
                          text="Download csv"
                          onClick={() => {
                            handleDownload(form);
                          }}
                        />
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
          <Button
            onClick={handleClose}
            type="secondary"
            color="gray"
            text="Close"
          />
        </CustomDialog>
      )}
    </>
  );
};
