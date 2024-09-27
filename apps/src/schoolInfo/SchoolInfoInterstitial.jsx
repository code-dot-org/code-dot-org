import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import BaseDialog from '../templates/BaseDialog';
import SchoolDataInputs from '../templates/SchoolDataInputs';
import color from '../util/color';

import {useSchoolInfo} from './hooks/useSchoolInfo';
import {schoolInfoValid} from './utils/schoolInfoValid';
import {updateSchoolInfo} from './utils/updateSchoolInfo';

export default function SchoolInfoInterstitial({
  scriptData: {existingSchoolInfo, usIp},
  onClose,
}) {
  const schoolInfo = useSchoolInfo({
    usIp,
    country: existingSchoolInfo.country,
    schoolName: existingSchoolInfo.school_name,
    schoolId: existingSchoolInfo.school_id,
    schoolZip: existingSchoolInfo.school_zip,
    schoolType: existingSchoolInfo.school_type,
  });

  const [showSchoolInfoUnknownError, setShowSchoolInfoUnknownError] =
    useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_SHOW,
      {},
      PLATFORMS.BOTH
    );
  }, []);

  const saveDisabled = useMemo(
    () =>
      schoolInfoValid({
        schoolId: schoolInfo.schoolId,
        country: schoolInfo.country,
        schoolName: schoolInfo.schoolName,
        schoolZip: schoolInfo.schoolZip,
        schoolsList: schoolInfo.schoolsList,
      }),
    [
      schoolInfo.country,
      schoolInfo.schoolId,
      schoolInfo.schoolZip,
      schoolInfo.schoolName,
      schoolInfo.schoolsList,
    ]
  );

  const handleSchoolInfoSubmit = async () => {
    const hasNcesId =
      schoolInfo.schoolId &&
      !Object.values(NonSchoolOptions).includes(schoolInfo.schoolId);
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
      {
        hasNcesId: hasNcesId.toString(),
        attempt: showSchoolInfoUnknownError ? 2 : 1,
      },
      PLATFORMS.BOTH
    );

    try {
      await updateSchoolInfo({
        schoolId: schoolInfo.schoolId,
        country: schoolInfo.country,
        schoolName: schoolInfo.schoolName,
        schoolZip: schoolInfo.schoolZip,
      });

      analyticsReporter.sendEvent(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_SUCCESS,
        {
          attempt: showSchoolInfoUnknownError ? 2 : 1,
        },
        PLATFORMS.BOTH
      );

      onClose();
    } catch (error) {
      analyticsReporter.sendEvent(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_FAILURE,
        {
          attempt: showSchoolInfoUnknownError ? 2 : 1,
        },
        PLATFORMS.BOTH
      );

      if (!showSchoolInfoUnknownError) {
        // First failure, display error message and give the teacher a chance
        // to try again.
        setShowSchoolInfoUnknownError(true);
      } else {
        // We already failed once, let's not block the teacher any longer.
        onClose();
      }
    }
  };

  const dismissSchoolInfoForm = () => {
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_DISMISS,
      {},
      PLATFORMS.BOTH
    );
    setIsOpen(false);
    onClose();
  };

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={isOpen}
      handleClose={onClose}
      uncloseable
      overflow={'visible'}
    >
      <div style={styles.container}>
        {showSchoolInfoUnknownError && (
          <p style={styles.error}>
            {i18n.schoolInfoInterstitialUnknownError()}
          </p>
        )}
        <div style={styles.middle}>
          <SchoolDataInputs {...schoolInfo} />
        </div>
        <div style={styles.bottom}>
          <Button
            onClick={dismissSchoolInfoForm}
            style={styles.button}
            color="gray"
            size="large"
            text={i18n.dismiss()}
            id="dismiss-button"
          />
          <Button
            onClick={handleSchoolInfoSubmit}
            style={styles.button}
            size="large"
            text={i18n.save()}
            color={Button.ButtonColor.brandSecondaryDefault}
            id="save-button"
            disabled={saveDisabled}
          />
        </div>
      </div>
    </BaseDialog>
  );
}

SchoolInfoInterstitial.propTypes = {
  // This component is tightly bound to the HAML view that renders it and
  // populates its props, and similarly to the User update API that
  // it uses to save entered school info.
  scriptData: PropTypes.shape({
    usIp: PropTypes.bool.isRequired,
    existingSchoolInfo: PropTypes.shape({
      country: PropTypes.string,
      school_id: PropTypes.string,
      school_name: PropTypes.string,
      school_zip: PropTypes.string,
      school_type: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
    fontSize: 13,
  },
  heading: {
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
  },
  middle: {
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  error: {
    color: color.red,
  },
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15,
    marginBottom: 15,
  },
};
