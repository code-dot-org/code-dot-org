'use client';

import {useStatsigClient} from '@statsig/react-bindings';
import {useCallback, useState, useEffect} from 'react';

import Button, {LinkButton} from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {
  Heading2,
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';

import SchoolSearchFieldset from '@/components/contentful/schoolSearchFieldset';
import {getStudioUrl} from '@/config/studio';

import type {AFESchoolCheckProps, AFESchoolCheckFormData} from './types';

import styles from './afeEligibility.module.scss';

const NO_SCHOOL_ID = '-1';
const SUPPORT_EMAIL = 'support@code.org';
const REQUIREMENTS_ID = 'afe-requirements';

const defaultFormData: AFESchoolCheckFormData = {
  email: '',
  zipCode: '',
  schoolId: '',
  schoolName: '',
};

const AFESchoolCheck: React.FC<AFESchoolCheckProps> = ({
  email = '',
  onComplete,
}) => {
  const {logEvent} = useStatsigClient();
  const [showIneligibleNotice, setShowIneligibleNotice] = useState(false);
  const [isFormSubmitted, setFormSubmission] = useState(false);
  const [formData, setFormData] =
    useState<AFESchoolCheckFormData>(defaultFormData);
  const [formError, setFormError] = useState('');

  const updateFormData = (newFormData: Partial<AFESchoolCheckFormData>) => {
    setFormData(oldFormData => ({
      ...oldFormData,
      ...newFormData,
    }));
    setFormError('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {name, value} = e.target;
    updateFormData({[name]: value});
  };

  const handleComplete = useCallback(
    (isEligible: boolean) =>
      onComplete({
        isEligible,
        email: formData.email,
        schoolId: formData.schoolId,
        schoolName: formData.schoolName,
      }),
    [onComplete, formData],
  );

  const handleEligibility = (isEligible: boolean) => {
    if (isEligible) {
      handleComplete(true);
    } else {
      logEvent('AFE Ineligible');
      setShowIneligibleNotice(true);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Let the browser show validation messages
    if (!e.currentTarget.checkValidity()) return;

    logEvent('AFE Submit School Info');

    if (!formData.schoolId) {
      handleEligibility(false);
    } else {
      setFormSubmission(true);

      fetch(
        getStudioUrl(
          `/dashboardapi/v1/schools/${formData.schoolId}/afe_high_needs`,
        ),
      )
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
        .then(schoolData => {
          handleEligibility(schoolData.afe_high_needs);
        })
        .catch(error => {
          setFormError(
            typeof error === 'string'
              ? error
              : 'Something went wrong. Please try again later',
          );
        })
        .finally(() => {
          setFormSubmission(false);
        });
    }
  };

  useEffect(() => {
    updateFormData({email});
  }, [email]);

  return (
    <>
      <Heading2>Am I eligible?</Heading2>

      <BodyThreeText>
        Enter your teacher email address and select your school below to find
        out if you're eligible to participate in the Amazon Future Engineer
        program, which offers free support for participating Code.org
        classrooms.
      </BodyThreeText>

      <form onSubmit={handleSubmit}>
        <TextField
          required
          inputType="email"
          name="email"
          label="Email"
          className={styles.afeEligibilityFormField}
          value={formData.email}
          onChange={handleChange}
        />

        <SchoolSearchFieldset
          required
          noSchoolId={NO_SCHOOL_ID}
          className={styles.afeEligibilityFormField}
          onSelect={school =>
            updateFormData({
              zipCode: school?.zip || defaultFormData.zipCode,
              schoolId: school?.nces_id || defaultFormData.schoolId,
              schoolName: school?.name || defaultFormData.schoolName,
            })
          }
        />

        {formError && (
          <BodyThreeText className={styles.afeEligibilityErrorText}>
            {formError}
          </BodyThreeText>
        )}

        <Button
          buttonTagTypeAttribute="submit"
          text="Find out if I'm eligible"
          isPending={isFormSubmitted}
          disabled={!!formError}
          onClick={() => {}}
        />
      </form>

      {showIneligibleNotice && (
        <CustomDialog
          className={styles.afeEligibilityNotice}
          aria-labelledby="afe-ineligible-notice-header"
          onClose={() => {
            setShowIneligibleNotice(false);
            handleComplete(false);
          }}
        >
          <Heading2 id="afe-ineligible-notice-header">
            We've checked your eligibility
          </Heading2>

          <BodyThreeText id="dsco-dialog-description">
            Your school does not meet the eligibility{' '}
            <Link
              size="s"
              href={`#${REQUIREMENTS_ID}`}
              aria-describedby={REQUIREMENTS_ID}
            >
              requirements*
            </Link>{' '}
            for the Amazon Future Engineer benefits, but you can still take
            advantage of all Code.org has to offer, including our robust
            curriculum and professional learning opportunities.
          </BodyThreeText>

          <BodyThreeText>
            If you think you received this message in error, contact us at{' '}
            <Link size="s" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </Link>
          </BodyThreeText>

          <LinkButton
            href="/teach"
            text="Start teaching with Code.org"
            className={styles.afeEligibilityNoticeLink}
          />

          <BodyFourText
            id={REQUIREMENTS_ID}
            className={styles.afeEligibilityInfoText}
          >
            *To participate in the Amazon Future Engineer program, a school must
            have Title 1 status OR have student enrollment of more than 40%
            underrepresented minority students and/or 40% students who qualify
            for free or reduced lunch.
          </BodyFourText>
        </CustomDialog>
      )}
    </>
  );
};

export default AFESchoolCheck;
