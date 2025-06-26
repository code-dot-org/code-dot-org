import {useMemo} from 'react';

import Checkbox from '@code-dot-org/component-library/checkbox';
import Chips from '@code-dot-org/component-library/chips';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {BodyThreeText} from '@code-dot-org/component-library/typography';

import Divider from '@/components/contentful/divider';

import {
  YOUR_SCHOOL_QUANTITIES,
  YOUR_SCHOOL_FREQUENCIES,
  YOUR_SCHOOL_COURSE_TOPICS,
} from '../constants';
import {YourSchoolFormData} from '../types';

import styles from '../yourSchool.module.scss';

const QUANTITY_OPTIONS = Object.entries(YOUR_SCHOOL_QUANTITIES).map(
  ([text, value]) => ({text, value}),
);
const FREQUENCY_OPTIONS = Object.entries(YOUR_SCHOOL_FREQUENCIES).map(
  ([text, value]) => ({text, value}),
);
const COURSE_TOPIC_OPTIONS = Object.entries(YOUR_SCHOOL_COURSE_TOPICS).map(
  ([value, label]) => ({label, value}),
);
const COURSE_TOPIC_FIELDS = Object.keys(
  YOUR_SCHOOL_COURSE_TOPICS,
) as (keyof YourSchoolFormData)[];

interface YourSchoolFormFieldset2Props {
  showFollowUp: boolean;
  showOtherDesc: boolean;
  formData: YourSchoolFormData;
  formErrors: Record<string, string | undefined>;
  onFormDataChange: (newData: Partial<YourSchoolFormData>) => void;
}

const YourSchoolFormFieldset2: React.FC<YourSchoolFormFieldset2Props> = ({
  showFollowUp,
  showOtherDesc,
  formData,
  formErrors,
  onFormDataChange,
}) => {
  const formCourseTopics = useMemo(
    () => COURSE_TOPIC_FIELDS.filter(courseTopic => formData[courseTopic]),
    COURSE_TOPIC_FIELDS.map(courseTopic => formData[courseTopic]),
  );

  return (
    <fieldset className={styles.yourSchoolFormFieldset}>
      <legend className={styles.yourSchoolFormFieldsetTitle}>
        <FontAwesomeV6Icon
          aria-label="2."
          iconName="circle-2"
          className={styles.yourSchoolFormFieldsetIcon}
        />
        CS education at your school
      </legend>

      <BodyThreeText className={styles.yourSchoolFormFieldsetDesc}>
        How much coding/computer programming is taught at this school? (assume
        for the purposes of these questions that this does not include HTML/CSS,
        Web design, or how to use apps) *
      </BodyThreeText>

      <Divider />

      <SimpleDropdown
        required
        labelText="How many students do an Hour of Code?"
        name="how_many_do_hoc"
        items={QUANTITY_OPTIONS}
        selectedValue={formData.how_many_do_hoc}
        errorMessage={formErrors.how_many_do_hoc}
        className={styles.yourSchoolFormDropdownRow}
        onChange={e => onFormDataChange({how_many_do_hoc: e.target.value})}
      />

      <Divider />

      <SimpleDropdown
        required
        labelText="How many students do computer programming in an after-school program?"
        name="how_many_after_school"
        items={QUANTITY_OPTIONS}
        selectedValue={formData.how_many_after_school}
        errorMessage={formErrors.how_many_after_school}
        className={styles.yourSchoolFormDropdownRow}
        onChange={e =>
          onFormDataChange({how_many_after_school: e.target.value})
        }
      />

      <Divider />

      <SimpleDropdown
        required
        labelText="How many students take at least 10 hours of computer programming integrated into a non-Computer Science course (such as TechEd, Math, Science, Art, Library or general classroom/homeroom)?"
        name="how_many_10_hours"
        items={QUANTITY_OPTIONS}
        selectedValue={formData.how_many_10_hours}
        errorMessage={formErrors.how_many_10_hours}
        className={styles.yourSchoolFormDropdownRow}
        onChange={e => onFormDataChange({how_many_10_hours: e.target.value})}
      />

      <Divider />

      <SimpleDropdown
        required
        labelText="How many students take a semester or year-long computer science course that includes at least 20 hours of coding/computer programming?"
        name="how_many_20_hours"
        items={QUANTITY_OPTIONS}
        selectedValue={formData.how_many_20_hours}
        errorMessage={formErrors.how_many_20_hours}
        className={styles.yourSchoolFormDropdownRow}
        onChange={e => onFormDataChange({how_many_20_hours: e.target.value})}
      />

      {showFollowUp && (
        <div className={styles.yourSchoolFormFollowUp}>
          <fieldset>
            <legend>
              Your school offers a semester or year long computer science class!
              What topics does this course include? *
            </legend>

            <Chips
              name="course_topics"
              options={COURSE_TOPIC_OPTIONS}
              values={formCourseTopics}
              required={!(formData.topic_other || formData.topic_do_not_know)}
              requiredMessageText={
                'Please select at least one topic or check "Other" or "I don\'t know"'
              }
              size="xs"
              className={styles.yourSchoolFormFieldsetChips}
              setValues={courseTopics =>
                COURSE_TOPIC_FIELDS.forEach(courseTopic =>
                  onFormDataChange({
                    [courseTopic]: courseTopics.includes(courseTopic),
                  }),
                )
              }
            />

            <div className={styles.yourSchoolFormFollowUpRow}>
              <Checkbox
                required={
                  !(formData.topic_do_not_know || formCourseTopics.length)
                }
                size="s"
                label="Other"
                name="topic_other"
                checked={formData.topic_other}
                style={{display: 'inline-flex'}}
                onChange={e =>
                  onFormDataChange({topic_other: e.target.checked})
                }
              />

              <Checkbox
                required={!(formData.topic_other || formCourseTopics.length)}
                size="s"
                label="I don’t know"
                name="topic_do_not_know"
                style={{display: 'inline-flex'}}
                checked={formData.topic_do_not_know}
                onChange={e =>
                  onFormDataChange({topic_do_not_know: e.target.checked})
                }
              />
            </div>

            {showOtherDesc && (
              <TextField
                label="If other, please describe:"
                inputType="text"
                name="topic_other_description"
                value={formData.topic_other_description}
                errorMessage={formErrors.topic_other_description}
                onChange={e =>
                  onFormDataChange({topic_other_description: e.target.value})
                }
              />
            )}
          </fieldset>

          <SimpleDropdown
            required
            labelText="How often per week does this class meet?"
            name="class_frequency"
            items={FREQUENCY_OPTIONS}
            selectedValue={formData.class_frequency}
            errorMessage={formErrors.class_frequency}
            onChange={e => onFormDataChange({class_frequency: e.target.value})}
          />

          <FormFieldWrapper
            label="Please tell us more about this course"
            helperMessage="For example, name of the class, how often it meets, description of what is taught"
            errorMessage={formErrors.tell_us_more}
          >
            <textarea
              name="tell_us_more"
              value={formData.tell_us_more}
              onChange={e => onFormDataChange({tell_us_more: e.target.value})}
            />
          </FormFieldWrapper>
        </div>
      )}

      <Divider />

      <Checkbox
        size="s"
        label="This school teaches other computing classes that do not include at least 20 hours of coding/computer programming. (For example, learning to use applications, computer literacy, web design, HTML/CSS, or other)"
        name="other_classes_under_20_hours"
        checked={formData.other_classes_under_20_hours}
        onChange={e =>
          onFormDataChange({other_classes_under_20_hours: e.target.checked})
        }
      />
    </fieldset>
  );
};

export default YourSchoolFormFieldset2;
