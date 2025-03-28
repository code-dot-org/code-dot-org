import {
  CheckboxDropdown,
  SimpleDropdown,
} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import Tags from '@code-dot-org/component-library/tags';
import TextField from '@code-dot-org/component-library/textField';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, useCallback, useMemo} from 'react';

import {useFetch} from '@cdo/apps/util/useFetch';
import {StudentGradeLevels} from '@cdo/generated-scripts/sharedConstants';

import {BasicsProps, CourseOffering} from '../types';

import commonStyles from '../styles.module.scss';

export const Basics: FC<BasicsProps> = ({
  config: {fields},
  name,
  grades,
  subject,
  prereq,
  hasPrereq,
  capacity,
  description,
  courseOfferings,
  dispatchWorkshop,
}) => {
  const {data: fetchedCourseOfferings} = useFetch<CourseOffering[]>(
    fields.course_offerings
      ? '/course_offerings/self_paced_pl_course_offerings'
      : ''
  );

  const courseOfferingsById = useMemo(
    () =>
      fetchedCourseOfferings?.reduce(
        (acc: Record<number, CourseOffering>, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {}
      ),
    [fetchedCourseOfferings]
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const {name, value} = e.target;
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {
          [name]: name === 'hasPrereq' ? value === 'true' : value,
        },
      });
    },
    [dispatchWorkshop]
  );

  const handleGradesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatchWorkshop({
        type: e.target.checked ? 'ADD_GRADE' : 'REMOVE_GRADE',
        payload: e.target.value,
      });
    },
    [dispatchWorkshop]
  );

  const handleCourseOfferingsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatchWorkshop({
        type: e.target.checked
          ? 'ADD_COURSE_OFFERING'
          : 'REMOVE_COURSE_OFFERING',
        payload: e.target.value,
      });
    },
    [dispatchWorkshop]
  );

  const handleSelectAllCourseOfferings = useCallback(() => {
    dispatchWorkshop({
      type: 'SET_COURSE_OFFERINGS',
      payload: fetchedCourseOfferings?.map(({id}) => id.toString()) ?? [],
    });
  }, [dispatchWorkshop, fetchedCourseOfferings]);

  const handleClearAllCourseOfferings = useCallback(() => {
    dispatchWorkshop({
      type: 'SET_COURSE_OFFERINGS',
      payload: [],
    });
  }, [dispatchWorkshop]);

  const handleRemoveCourseOffering = useCallback(
    (offeringId: string) => () => {
      dispatchWorkshop({
        type: 'REMOVE_COURSE_OFFERING',
        payload: offeringId,
      });
    },
    [dispatchWorkshop]
  );

  const subjectOptions = useMemo(() => {
    let options = [{value: '', text: 'Select a subject'}];
    if (fields.subject?.options) {
      options = options.concat(
        fields.subject.options.map(({value, label}) => ({value, text: label}))
      );
    }
    return options;
  }, [fields.subject?.options]);

  return (
    <>
      <Heading2 visualAppearance="heading-sm">Workshop Basics</Heading2>
      <div className={commonStyles.row}>
        {fields.name && (
          <TextField
            name="name"
            onChange={handleChange}
            value={name}
            label="Workshop name"
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.name.required,
            })}
          />
        )}
        {fields.grades && (
          <CheckboxDropdown
            name="grades"
            onChange={handleGradesChange}
            styleAsFormField={true}
            hideControls
            checkedOptions={grades}
            allOptions={StudentGradeLevels.map(value => ({
              value,
              label: value,
            }))}
            labelText="Grade levels"
            size="s"
            helperMessage="Select applicable grade levels for this workshop."
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.grades.required,
            })}
          />
        )}
        {fields.subject && (
          <SimpleDropdown
            name="subject"
            onChange={handleChange}
            styleAsFormField={true}
            items={subjectOptions}
            selectedValue={subject}
            labelText="Subject"
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.subject.required,
            })}
          />
        )}
      </div>
      <div className={commonStyles.row}>
        {fields.prereq && (
          <SimpleDropdown
            name="hasPrereq"
            onChange={handleChange}
            styleAsFormField={true}
            items={[
              {value: 'true', text: 'Has prerequisites'},
              {value: 'false', text: 'No experience needed'},
            ]}
            selectedValue={hasPrereq.toString()}
            labelText="Experience needed"
            helperMessage="Indicate if this workshop requires previous experience."
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.prereq.required,
            })}
          />
        )}
        {fields.capacity && (
          <TextField
            inputType="number"
            name="capacity"
            onChange={handleChange}
            value={capacity?.toString()}
            label="Capacity"
            helperMessage="Maximum number of attendees allowed."
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.capacity.required,
            })}
          />
        )}
        {/* empty space aligns with optional subject */}
        {subject && <div className={commonStyles.item} />}
      </div>
      <div className={commonStyles.row}>
        {fields.prereq && hasPrereq && (
          <div className={commonStyles.card}>
            <TextField
              name="prereq"
              onChange={handleChange}
              value={prereq}
              label="Workshop prerequisites"
              size="s"
              className={classNames(commonStyles.item, {
                [commonStyles.required]: fields.prereq.required,
              })}
            />
          </div>
        )}
      </div>
      <div className={commonStyles.row}>
        {description && (
          <FormFieldWrapper
            label="Workshop description"
            helperMessage="Public-facing summary to attract and inform participants."
            size="s"
            className={classNames(commonStyles.item, commonStyles.required)}
          >
            <textarea
              id="description"
              name="description"
              onChange={handleChange}
              value={description}
              placeholder="Enter description here"
            />
          </FormFieldWrapper>
        )}
      </div>
      <div className={commonStyles.row}>
        {fields.course_offerings && (
          <CheckboxDropdown
            name="courseOfferings"
            onChange={handleCourseOfferingsChange}
            onSelectAll={handleSelectAllCourseOfferings}
            selectAllText="Select all"
            clearAllText="Clear all"
            onClearAll={handleClearAllCourseOfferings}
            styleAsFormField={true}
            checkedOptions={courseOfferings}
            allOptions={
              fetchedCourseOfferings?.map(({id, display_name}) => ({
                value: id.toString(),
                label: display_name,
              })) ?? []
            }
            labelText="Select workshop topic(s)"
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.course_offerings.required,
            })}
          />
        )}
      </div>
      {courseOfferingsById && (
        <Tags
          className={commonStyles.wrapContainer}
          tagsList={courseOfferings.map(offeringId => ({
            type: 'closable',
            onClose: handleRemoveCourseOffering(offeringId),
            label: courseOfferingsById[Number(offeringId)]?.display_name ?? '',
          }))}
        />
      )}
    </>
  );
};
