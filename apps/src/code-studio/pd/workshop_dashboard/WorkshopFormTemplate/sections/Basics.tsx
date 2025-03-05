import {
  CheckboxDropdown,
  SimpleDropdown,
} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {FC, useMemo} from 'react';

import {StudentGradeLevels} from '@cdo/generated-scripts/sharedConstants';

import {SectionProps} from '../types';

import commonStyles from '../styles.module.scss';

export const Basics: FC<SectionProps> = ({
  config: {
    fields: {name, grades, subject, prereq, capacity},
  },
  state,
  handleChange,
}) => {
  const handleGradesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedGrades = [...state.grades];
    if (e.target.checked) {
      selectedGrades.push(e.target.value);
      selectedGrades.sort((a, b) => {
        if (a === 'K') return -1;
        if (b === 'K') return 1;
        const numA = Number(a);
        const numB = Number(b);
        if (isNaN(numA) || isNaN(numB)) return 0;
        return numA - numB;
      });
    } else {
      selectedGrades = selectedGrades.filter(g => g !== e.target.value);
    }
    handleChange({grades: selectedGrades});
  };

  const subjectOptions = useMemo(() => {
    let options = [{value: '', text: 'Select a subject'}];
    if (subject?.options) {
      options = options.concat(
        subject.options.map(({value, label}) => ({value, text: label}))
      );
    }
    return options;
  }, [subject?.options]);

  return (
    <div>
      <Heading2 visualAppearance="heading-sm">Workshop Basics</Heading2>
      <div className={commonStyles.row}>
        {name && (
          <TextField
            name="name"
            onChange={e => handleChange({name: e.target.value})}
            value={state.name}
            label="Workshop name"
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: name.required,
            })}
          />
        )}
        {grades && (
          <CheckboxDropdown
            name="grades"
            onChange={handleGradesChange}
            styleAsFormField={true}
            hideControls
            checkedOptions={state.grades}
            allOptions={StudentGradeLevels.map(value => ({
              value,
              label: value,
            }))}
            labelText="Grade levels"
            size="s"
            helperMessage="Select applicable grade levels for this workshop."
            className={classNames(commonStyles.item, {
              [commonStyles.required]: grades.required,
            })}
          />
        )}
        {subject && (
          <SimpleDropdown
            name="subject"
            onChange={e => handleChange({subject: e.target.value})}
            styleAsFormField={true}
            items={subjectOptions}
            selectedValue={state.subject}
            labelText="Subject"
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: subject.required,
            })}
          />
        )}
      </div>
      <div className={commonStyles.row}>
        {prereq && (
          <SimpleDropdown
            name="has-prereq"
            onChange={e => {
              const hasPrereq = e.target.value === 'true';
              handleChange({
                hasPrereq,
                prereq: hasPrereq ? state.prereq : '',
              });
            }}
            styleAsFormField={true}
            items={[
              {value: 'true', text: 'Has prerequisites'},
              {value: 'false', text: 'No experience needed'},
            ]}
            selectedValue={state.hasPrereq.toString()}
            labelText="Experience needed"
            helperMessage="Indicate if this workshop requires previous experience."
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: prereq.required,
            })}
          />
        )}
        {capacity && (
          <TextField
            inputType="number"
            name="capacity"
            onChange={e =>
              handleChange({
                capacity: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            value={state.capacity?.toString()}
            label="Capacity"
            helperMessage="Maximum number of attendees allowed."
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: capacity.required,
            })}
          />
        )}
        {/* empty space */}
        {subject && <div className={commonStyles.item} />}
      </div>
      <div className={commonStyles.row}>
        {state.hasPrereq && (
          <div className={commonStyles.card}>
            <TextField
              name="prereq"
              onChange={e => handleChange({prereq: e.target.value})}
              value={state.prereq}
              label="Workshop prerequisites"
              size="s"
              className={classNames(commonStyles.item, commonStyles.required)}
            />
          </div>
        )}
      </div>
      <div className={commonStyles.row}>
        <FormFieldWrapper label="Workshop description">
          <textarea
            id="description"
            name="description"
            onChange={e => handleChange({description: e.target.value})}
            value={state.description}
          />
        </FormFieldWrapper>
      </div>
    </div>
  );
};
