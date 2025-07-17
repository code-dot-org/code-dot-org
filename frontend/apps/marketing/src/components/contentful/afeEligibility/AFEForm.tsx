'use client';

import {useStatsigClient} from '@statsig/react-bindings';
import React, {useCallback, useRef, useState, useEffect} from 'react';

import Button from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {
  SimpleDropdown,
  CheckboxDropdown,
} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {
  Heading2,
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';

import {getStudioUrl} from '@/config/studio';

import Divider from '../divider';

import AFEContinueNotice from './AFEContinueNotice';
import AFESuccessNotice from './AFESuccessNotice';
import type {AFEFormProps, AFEFormData} from './types';

import styles from './afeEligibility.module.scss';

const SESSION_STORAGE_KEY = 'afeEligibilityFormData';
const CSTA_PROFESSIONAL_ROLES = [
  'K-12 Teacher',
  'Pre-Service Teacher',
  'School Administrator',
  'District Administrator',
  'State Department of Education',
  'Higher Education Faculty',
  'Non-Profit',
  'Corporate',
  'Other',
];
const CSTA_GRADE_BANDS = ['K-5', '6-8', '9-12'];

const AFEForm: React.FC<AFEFormProps> = ({
  email,
  schoolId,
  schoolName,
  isSignedIn = false,
  onEligibilityReset,
}) => {
  const {logEvent} = useStatsigClient();

  const getSessionFormData = () =>
    typeof sessionStorage === 'undefined'
      ? {}
      : JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}');

  const formRef = useRef<HTMLFormElement>(null);
  const [showContinueNotice, setShowContinueNotice] = useState(false);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);
  const [isFormSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<AFEFormData>({
    email,
    schoolId,
    schoolName,
    firstName: '',
    lastName: '',
    professionalRole: CSTA_PROFESSIONAL_ROLES[0],
    gradeBands: [],
    inspirationKit: false,
    consentCSTA: false,
    consentAFE: false,
    ...getSessionFormData(),
  });

  const handleEligibilityReset = useCallback(() => {
    sessionStorage?.removeItem(SESSION_STORAGE_KEY);
    onEligibilityReset();
  }, [onEligibilityReset]);

  const updateFormData = (newFormData: Partial<AFEFormData>) => {
    setFormData(oldFormData => ({
      ...oldFormData,
      ...newFormData,
    }));
    setFormError('');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {name, value} = e.target;
    updateFormData({[name]: value});
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = e.target;
    updateFormData({[name]: checked});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Let the browser show validation messages
    if (!e.currentTarget.checkValidity()) return;

    setFormSubmitting(true);

    const formJson = JSON.stringify(formData);
    sessionStorage?.setItem(SESSION_STORAGE_KEY, formJson);

    if (!isSignedIn) {
      logEvent('AFE Continue', undefined, {
        submitData: formJson,
        isSignedIn: String(isSignedIn),
      });

      setFormSubmitting(false);
      setShowContinueNotice(true);

      return;
    }

    logEvent('AFE Submit', undefined, {
      formEmail: formData.email,
      formSchoolId: formData.schoolId,
      formData: formJson,
    });

    fetch(getStudioUrl('/dashboardapi/v1/amazon_future_engineer_submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body: new URLSearchParams({
        'amazon_future_engineer[email]': formData.email,
        'amazon_future_engineer[firstName]': formData.firstName,
        'amazon_future_engineer[lastName]': formData.lastName,
        'amazon_future_engineer[schoolId]': formData.schoolId,
        'amazon_future_engineer[primaryProfessionalRole]':
          formData.professionalRole,
        'amazon_future_engineer[gradesTeaching]':
          formData.gradeBands.join(', '),
        'amazon_future_engineer[inspirationKit]': String(
          formData.inspirationKit,
        ),
        'amazon_future_engineer[csta]': String(formData.consentCSTA),
        'amazon_future_engineer[consentCSTA]': String(formData.consentCSTA),
        'amazon_future_engineer[consentAFE]': String(formData.consentAFE),
      }),
    })
      .then(async response => {
        if (response.ok) {
          sessionStorage?.removeItem(SESSION_STORAGE_KEY);
          setShowSuccessNotice(true);
          return true;
        } else {
          const errorText = await response.text();
          throw new Error(
            `Form submission failed with HTTP ${response.status} ${response.statusText}: ${errorText}`,
          );
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
  };

  useEffect(() => {
    if (isSignedIn && formRef.current?.checkValidity()) {
      formRef.current.requestSubmit();
    }
  }, [isSignedIn]);

  useEffect(() => {
    updateFormData({email: email});
  }, [email]);

  useEffect(() => {
    updateFormData({schoolId, schoolName});
  }, [schoolId, schoolName]);

  return (
    <>
      <Heading2 className={styles.afeEligibilityBrandText}>
        <FontAwesomeV6Icon iconName="check-circle" /> You teach at an eligible
        school!
      </Heading2>

      <BodyThreeText>
        Please complete the form below to access free and relevant resources for
        you and your students
      </BodyThreeText>

      <form ref={formRef} onSubmit={handleSubmit}>
        <TextField
          required
          inputType="email"
          name="email"
          label="Email"
          className={styles.afeEligibilityFormField}
          value={formData.email}
          onChange={handleInputChange}
        />

        <TextField
          required
          readOnly
          inputType="text"
          name="school"
          label="School"
          className={styles.afeEligibilityFormField}
          value={schoolName}
          onChange={() => {}}
        />

        <BodyThreeText className={styles.afeEligibilityFormHelper}>
          Wrong school?{' '}
          <Link size="s" onClick={handleEligibilityReset}>
            Go back
          </Link>
        </BodyThreeText>

        <fieldset className={styles.afeEligibilityFormGrid}>
          <TextField
            required
            inputType="text"
            name="firstName"
            label="First name"
            className={styles.afeEligibilityFormField}
            value={formData.firstName}
            onChange={handleInputChange}
          />

          <TextField
            required
            inputType="text"
            name="lastName"
            label="Last name"
            className={styles.afeEligibilityFormField}
            value={formData.lastName}
            onChange={handleInputChange}
          />

          <SimpleDropdown
            name="professionalRole"
            labelText="What is your role?"
            className={styles.afeEligibilityFormField}
            selectedValue={formData.professionalRole}
            onChange={handleInputChange}
            items={CSTA_PROFESSIONAL_ROLES.map(role => ({
              value: role,
              text: role,
            }))}
          />

          <CheckboxDropdown
            styleAsFormField
            hideControls
            name="gradeBands"
            labelText="What grade bands do you teach?"
            className={styles.afeEligibilityFormField}
            checkedOptions={formData.gradeBands}
            allOptions={CSTA_GRADE_BANDS.map(gradeBand => ({
              value: gradeBand,
              label: gradeBand,
            }))}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateFormData({
                gradeBands: e.target.checked
                  ? [...formData.gradeBands, e.target.value]
                  : formData.gradeBands.filter(
                      value => value !== e.target.value,
                    ),
              });
            }}
          />
        </fieldset>

        <Divider margin="s" />

        <fieldset className={styles.afeEligibilityFormField}>
          <legend>
            How can Amazon Future Engineer support you and your students?
          </legend>

          <Checkbox
            size="s"
            name="inspirationKit"
            label="Send me a Thank You Kit with Amazon Future Engineer-branded gear (t-shirts, drinkware, stickers, and more!)"
            checked={formData.inspirationKit}
            onChange={handleCheckboxChange}
          />

          <Checkbox
            size="s"
            name="consentCSTA"
            label={
              <>
                I opt-in for a free CSTA+ membership and access to Amazon
                webinars and content. I authorize Code.org to share my personal
                information with CSTA for membership purposes, as outlined in
                the{' '}
                <Link
                  external
                  openInNewTab
                  size="s"
                  href="https://csteachers.org/privacy-policy"
                >
                  CSTA Privacy Policy
                </Link>
              </>
            }
            checked={formData.consentCSTA}
            onChange={handleCheckboxChange}
          />
        </fieldset>

        <Divider margin="s" />

        <fieldset className={styles.afeEligibilityFormField}>
          <Checkbox
            required
            size="s"
            name="consentAFE"
            label={
              <>
                I give Code.org permission to share my name and email address,
                and my school's name, address, and NCES ID, with Amazon.com
                (required to participate). Use of your personal information is
                subject to{' '}
                <Link
                  external
                  openInNewTab
                  size="s"
                  href="https://www.amazon.com/gp/help/customer/display.html?ie=UTF8&nodeId=468496"
                >
                  Amazon’s Privacy Policy
                </Link>
              </>
            }
            checked={formData.consentAFE}
            onChange={handleCheckboxChange}
          />
        </fieldset>

        <BodyFourText className={styles.afeEligibilityInfoText}>
          By continuing, you'll get emails from Amazon Future Engineer to claim
          benefits and updates on scholarships, grants, and more. You can change
          preferences or unsubscribe at any time.
        </BodyFourText>

        {formError && (
          <BodyFourText className={styles.afeEligibilityErrorText}>
            {formError}
          </BodyFourText>
        )}

        <Button
          buttonTagTypeAttribute="submit"
          text="Continue"
          className={styles.afeEligibilityFormButton}
          isPending={isFormSubmitting}
          disabled={!!formError}
          onClick={() => {}}
        />
      </form>

      {showContinueNotice && (
        <AFEContinueNotice onClose={() => setShowContinueNotice(false)} />
      )}

      {showSuccessNotice && (
        <AFESuccessNotice
          onClose={() => {
            setShowSuccessNotice(false);
            handleEligibilityReset();
          }}
        />
      )}
    </>
  );
};

export default AFEForm;
