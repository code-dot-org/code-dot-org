import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import SchoolSearchFieldset from '@/components/contentful/schoolSearchFieldset';

import {YOUR_SCHOOL_ROLES, YOUR_SCHOOL_DEFAULT_FORM_DATA} from '../constants';
import {YourSchoolFormData, School} from '../types';

import styles from '../yourSchool.module.scss';

const ROLE_OPTIONS = Object.entries(YOUR_SCHOOL_ROLES).map(([text, value]) => ({
  text,
  value,
}));

interface YourSchoolFormFieldset1Props {
  formData: Pick<
    YourSchoolFormData,
    | 'nces_school_s'
    | 'submitter_email_address'
    | 'submitter_name'
    | 'submitter_role'
  >;
  formErrors: Record<string, string | undefined>;
  school?: School | null;
  onFormDataChange: (newData: Partial<YourSchoolFormData>) => void;
}

const YourSchoolFormFieldset1: React.FC<YourSchoolFormFieldset1Props> = ({
  formData,
  formErrors,
  school = null,
  onFormDataChange,
}) => (
  <fieldset className={styles.yourSchoolFormFieldset}>
    <legend className={styles.yourSchoolFormFieldsetTitle}>
      <FontAwesomeV6Icon
        aria-label="1."
        iconName="circle-1"
        className={styles.yourSchoolFormFieldsetIcon}
      />
      Let's gather a few details first
    </legend>

    <SchoolSearchFieldset
      required
      school={school}
      errorMessage={formErrors.nces_school_s}
      onSelect={(school: YourSchoolFormFieldset1Props['school']) =>
        onFormDataChange({
          nces_school_s:
            school?.nces_id || YOUR_SCHOOL_DEFAULT_FORM_DATA.nces_school_s,
        })
      }
      className={styles.yourSchoolFormFieldsetRow}
    />

    <div className={styles.yourSchoolFormFieldsetRow}>
      <TextField
        required
        label="What is your email address?"
        inputType="email"
        name="submitter_email_address"
        value={formData.submitter_email_address}
        errorMessage={formErrors.submitter_email_address}
        onChange={e =>
          onFormDataChange({submitter_email_address: e.target.value})
        }
      />
    </div>

    <div className={styles.yourSchoolFormFieldsetRow}>
      <TextField
        label="Full Name"
        inputType="text"
        name="submitter_name"
        value={formData.submitter_name}
        errorMessage={formErrors.submitter_name}
        onChange={e => onFormDataChange({submitter_name: e.target.value})}
      />

      <SimpleDropdown
        required
        labelText="What is your connection to this school?"
        name="submitter_role"
        selectedValue={formData.submitter_role}
        errorMessage={formErrors.submitter_role}
        onChange={e => onFormDataChange({submitter_role: e.target.value})}
        items={ROLE_OPTIONS}
      />
    </div>
  </fieldset>
);

export default YourSchoolFormFieldset1;
