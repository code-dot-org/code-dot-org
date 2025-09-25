import {
  Heading2,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';

import Section from '@/components/contentful/section';
import Spacer from '@/components/contentful/spacer';

import {YOUR_SCHOOL_FORM_ID} from '../constants';
import type {YourSchoolProps, School} from '../types';

import YourSchoolForm from './YourSchoolForm';

import styles from '../yourSchool.module.scss';

interface YourSchoolFormSectionProps
  extends Pick<
    YourSchoolProps,
    | 'regionalPartnerURL'
    | 'privacyPolicyURL'
    | 'shareOnTwitterURL'
    | 'shareOnFacebookURL'
  > {
  school?: School | null;
}

const YourSchoolFormSection: React.FC<YourSchoolFormSectionProps> = ({
  regionalPartnerURL,
  privacyPolicyURL,
  shareOnTwitterURL,
  shareOnFacebookURL,
  school = null,
}) => (
  <Section
    background="patternDark"
    id={YOUR_SCHOOL_FORM_ID}
    className={styles.yourSchoolFormSection}
  >
    <Heading2 className={styles.yourSchoolFormHeading}>
      Tell us about CS education at your school
    </Heading2>

    <BodyTwoText className={styles.yourSchoolFormParagraph}>
      We want to bring computer science to every school—help us track our
      progress by taking this short survey!
    </BodyTwoText>

    <Spacer size="m" />

    <div data-theme="Light" className={styles.yourSchoolFormContainer}>
      <YourSchoolForm
        regionalPartnerURL={regionalPartnerURL}
        privacyPolicyURL={privacyPolicyURL}
        shareOnTwitterURL={shareOnTwitterURL}
        shareOnFacebookURL={shareOnFacebookURL}
        school={school}
      />
    </div>
  </Section>
);

export default YourSchoolFormSection;
