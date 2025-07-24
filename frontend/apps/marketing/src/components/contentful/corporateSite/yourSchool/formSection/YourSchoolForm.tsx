'use client';

import {useCallback, useEffect, useState, useMemo} from 'react';

import Button, {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {
  Heading3,
  BodyTwoText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';

import {getStudioUrl} from '@/config/studio';
import yourSchoolImg from '@public/images/yourschool.avif';

import {
  YOUR_SCHOOL_QUANTITIES,
  YOUR_SCHOOL_COURSE_TOPICS,
  YOUR_SCHOOL_DEFAULT_FORM_DATA,
} from '../constants';
import {YourSchoolFormProps, YourSchoolFormData} from '../types';

import YourSchoolFormFieldset1 from './YourSchoolFormFieldset1';
import YourSchoolFormFieldset2 from './YourSchoolFormFieldset2';
import YourSchoolFormFieldset3 from './YourSchoolFormFieldset3';

import styles from '../yourSchool.module.scss';

const YourSchoolForm: React.FC<YourSchoolFormProps> = ({
  regionalPartnerURL,
  privacyPolicyURL,
  shareOnTwitterURL,
  shareOnFacebookURL,
  school = null,
}) => {
  const [formData, setFormData] = useState<YourSchoolFormData>(
    YOUR_SCHOOL_DEFAULT_FORM_DATA,
  );
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isFormSubmitting, setFormSubmitting] = useState(false);
  const [isFormSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);

  const showFollowUp = useMemo(
    () =>
      [YOUR_SCHOOL_QUANTITIES.Some, YOUR_SCHOOL_QUANTITIES.All].includes(
        formData.how_many_20_hours,
      ),
    [formData.how_many_20_hours],
  );
  const showTopicOtherDesc = useMemo(
    () => !!formData.topic_other,
    [formData.topic_other],
  );

  const updateFormData = useCallback(
    (newFormData: Partial<YourSchoolFormData>) => {
      setFormData(oldFormData => ({
        ...oldFormData,
        ...newFormData,
      }));

      Object.keys(newFormData).forEach(formField => {
        setFormErrors(oldFormErrors => ({
          ...oldFormErrors,
          [formField]: '',
        }));
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Let the browser show validation messages
      if (!e.currentTarget.checkValidity()) return;

      setFormSubmitting(true);

      // Prepares request payload
      const payload: Record<string, string | boolean> = {...formData};
      // Ensures the map-picked school is set if no other school is selected
      if (!payload.nces_school_s && school)
        payload.nces_school_s = school.nces_id;
      // Removes follow-up fields if follow-up questions are not shown
      // to ensure the endpoint validation passes
      if (!showFollowUp) {
        [
          ...Object.keys(YOUR_SCHOOL_COURSE_TOPICS),
          'topic_do_not_know',
          'topic_other',
          'topic_other_description',
          'class_frequency',
          'tell_us_more',
        ].forEach(formField => delete payload[formField]);
      }
      // Removes the `Other` topic description if the `Other` topic is not checked
      if (!showTopicOtherDesc) delete payload.topic_other_description;
      // `share_with_regional_partners` must be present to pass endpoint validation
      payload.share_with_regional_partners = String(
        payload.share_with_regional_partners,
      );
      // Removes falsy values and trims truthy values to shorten the request query length
      Object.entries(payload).forEach(([formField, value]) => {
        if (typeof value === 'string' ? !value.trim() : !value) {
          // Removes falsy values
          delete payload[formField];
        } else {
          // Stringifies truthy values
          payload[formField] = String(value).trim();
        }
      });

      // Note: makes sure all falsy boolean values are removed from the payload,
      //       as the endpoint only checks whether checkbox parameters are present,
      //       ignoring their value (except `share_with_regional_partners`)
      fetch(getStudioUrl('/dashboardapi/v1/census/CensusYourSchool2017v7'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload as Record<string, string>),
      })
        .then(async response => {
          if (response.ok) {
            setFormSubmitted(true);
            setShowSuccessNotice(true);
            return true;
          } else if (response.status === 400) {
            const submitErrors: Record<string, string[]> =
              await response.json();
            const newFormErrors: Record<string, string> = {};
            const unknownErrors: string[] = [];

            if (
              submitErrors.country ||
              submitErrors.school_name ||
              submitErrors.school_infos
            ) {
              delete submitErrors.country;
              delete submitErrors.school_name;
              delete submitErrors.school_infos;
              newFormErrors.nces_school_s = 'Please choose a school';
            }

            Object.entries(submitErrors).forEach(([field, errors]) => {
              const error = errors.join(', ');
              if (field in YOUR_SCHOOL_DEFAULT_FORM_DATA) {
                newFormErrors[field] = error;
              } else {
                unknownErrors.push(`${field} ${error}`);
              }
            });

            setFormErrors(newFormErrors);
            setFormError(
              unknownErrors.length
                ? `Submit errors: ${unknownErrors.join('; ')}`
                : 'Please complete the required fields to submit',
            );
          } else {
            throw await response.text();
          }
        })
        .catch(error => {
          setFormError(
            typeof error === 'string'
              ? error
              : 'Something went wrong. Please try again later',
          );
        })
        .finally(() => {
          setFormSubmitting(false);
        });
    },
    [school, formData, showFollowUp, showTopicOtherDesc],
  );

  const handleSuccessNoticeClose = useCallback(() => {
    setShowSuccessNotice(false);
  }, []);

  useEffect(() => {
    updateFormData({
      nces_school_s:
        school?.nces_id || YOUR_SCHOOL_DEFAULT_FORM_DATA.nces_school_s,
    });
  }, [updateFormData, school]);

  useEffect(() => {
    if (!Object.values(formErrors).filter(Boolean).length) setFormError('');
  }, [formData, formErrors]);

  if (isFormSubmitted) {
    return (
      <>
        <Heading3
          visualAppearance="heading-sm"
          className={styles.yourSchoolFormSubmitted}
        >
          <FontAwesomeV6Icon
            iconName="check-circle"
            aria-hidden="true"
            className={styles.yourSchoolFormSubmittedIcon}
          />
          We've received your submission!
        </Heading3>

        {showSuccessNotice && (
          <Modal
            title="Thank you for telling us about your school!"
            imageUrl={yourSchoolImg.src}
            imagePlacement="inline"
            className={styles.yourSchoolNotice}
            onClose={handleSuccessNoticeClose}
            primaryButtonProps={{
              text: 'Return to page',
              type: 'secondary',
              color: 'black',
              onClick: handleSuccessNoticeClose,
            }}
            customContent={
              <div className={styles.yourSchoolNoticeContent}>
                <BodyTwoText
                  id="dsco-dialog-description"
                  className={styles.yourSchoolNoticeDesc}
                >
                  The information you shared helps us track our progress as we
                  work to bring CS to every school! Share this survey with
                  friends and coworkers and encourage them to join too!
                </BodyTwoText>

                <div className={styles.yourSchoolNoticeButtons}>
                  <LinkButton
                    text="Share on Twitter"
                    href={shareOnTwitterURL}
                    size="s"
                    iconLeft={{
                      iconFamily: 'brands',
                      iconName: 'x-twitter',
                    }}
                  />
                  <LinkButton
                    text="Share on Facebook"
                    href={shareOnFacebookURL}
                    size="s"
                    iconLeft={{
                      iconFamily: 'brands',
                      iconName: 'facebook',
                    }}
                  />
                </div>
              </div>
            }
          />
        )}
      </>
    );
  }

  return (
    <form
      aria-label="Survey"
      className={styles.yourSchoolForm}
      onSubmit={handleSubmit}
    >
      {/* 1. Let’s gather a few details first */}
      <YourSchoolFormFieldset1
        school={school}
        formData={formData}
        formErrors={formErrors}
        onFormDataChange={updateFormData}
      />

      {/* 2. CS education at your school */}
      <YourSchoolFormFieldset2
        showFollowUp={showFollowUp}
        showOtherDesc={showTopicOtherDesc}
        formData={formData}
        formErrors={formErrors}
        onFormDataChange={updateFormData}
      />

      {/* 3. Stay in touch? */}
      <YourSchoolFormFieldset3
        regionalPartnerURL={regionalPartnerURL}
        privacyPolicyURL={privacyPolicyURL}
        formData={formData}
        onFormDataChange={updateFormData}
      />

      <div className={styles.yourSchoolFormSubmit}>
        <Button
          text="Submit survey"
          buttonTagTypeAttribute="submit"
          className={styles.yourSchoolFormButton}
          isPending={isFormSubmitting}
          disabled={!!formError}
          onClick={() => {}}
        />

        {formError && (
          <BodyThreeText className={styles.yourSchoolFormError}>
            <FontAwesomeV6Icon iconName="circle-exclamation" /> {formError}
          </BodyThreeText>
        )}
      </div>
    </form>
  );
};

export default YourSchoolForm;
