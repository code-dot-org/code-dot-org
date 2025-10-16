import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';

import {YourSchoolFormProps, YourSchoolFormData} from '../types';

import styles from '../yourSchool.module.scss';

interface YourSchoolFormFieldset3Props
  extends Pick<YourSchoolFormProps, 'regionalPartnerURL' | 'privacyPolicyURL'> {
  formData: Pick<YourSchoolFormData, 'share_with_regional_partners' | 'opt_in'>;
  onFormDataChange: (newData: Partial<YourSchoolFormData>) => void;
}

const YourSchoolFormFieldset3: React.FC<YourSchoolFormFieldset3Props> = ({
  regionalPartnerURL,
  privacyPolicyURL,
  formData,
  onFormDataChange,
}) => (
  <fieldset className={styles.yourSchoolFormFieldset}>
    <legend className={styles.yourSchoolFormFieldsetTitle}>
      <FontAwesomeV6Icon
        aria-label="3."
        iconName="circle-3"
        className={styles.yourSchoolFormFieldsetIcon}
      />
      Stay in touch?
    </legend>

    <Checkbox
      size="s"
      label={
        <>
          Share my contact information with the Code.org{' '}
          <Link openInNewTab size="s" href={regionalPartnerURL}>
            regional partner
          </Link>{' '}
          in my state so I can be contacted about local professional learning,
          resources and events
        </>
      }
      name="share_with_regional_partners"
      checked={formData.share_with_regional_partners}
      onChange={e =>
        onFormDataChange({share_with_regional_partners: e.target.checked})
      }
    />

    <Checkbox
      size="s"
      label={
        <>
          Can we email you about updates to our courses, local opportunities, or
          other computer science news? (
          <Link openInNewTab size="s" href={privacyPolicyURL}>
            See our privacy policy
          </Link>
          )
        </>
      }
      name="opt_in"
      checked={formData.opt_in}
      onChange={e => onFormDataChange({opt_in: e.target.checked})}
    />
  </fieldset>
);

export default YourSchoolFormFieldset3;
