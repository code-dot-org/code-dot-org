import {Button} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {
  BodyOneText,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import styles from '../../workshop.module.scss';

export const ExportSurveysButton = () => {
  const {workshopId} = useParams<{workshopId: string}>();
  const [formsDialogOpen, setFormsDialogOpen] = useState(false);

  const {data: forms, loading} = useFetch<
    {name: string; version: string}[] | null
  >(
    workshopId
      ? `/api/v1/pd/workshops/${workshopId}/foorm/forms_for_workshop`
      : ''
  );

  const handleDownload = (form: {name: string; version: string}) => {
    if (workshopId) {
      window.open(
        `/api/v1/pd/workshops/${workshopId}/foorm/csv_survey_report?name=${encodeURIComponent(
          form.name
        )}&version=${encodeURIComponent(form.version)}`
      );
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
          className={styles.customDialog}
          onClose={() => setFormsDialogOpen(false)}
          aria-labelledby="export-survey-dialog-title"
        >
          <div
            id="dsco-dialog-description"
            className={styles.customDialogContent}
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
          </div>
          <Button
            onClick={() => setFormsDialogOpen(false)}
            type="secondary"
            color="gray"
            text="Close"
          />
        </CustomDialog>
      )}
    </>
  );
};
