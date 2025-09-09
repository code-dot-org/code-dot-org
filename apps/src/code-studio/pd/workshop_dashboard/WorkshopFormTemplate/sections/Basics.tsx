import {
  CheckboxDropdown,
  SimpleDropdown,
} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import Tags from '@code-dot-org/component-library/tags';
import TextField from '@code-dot-org/component-library/textField';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, memo, useCallback, useMemo} from 'react';

import {WorkshopGradeLevels} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {useFetch} from '@cdo/apps/util/useFetch';

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
  errors,
  dispatchWorkshop,
}) => {
  const {data: fetchedCourseOfferings} = useFetch<CourseOffering[]>(
    fields.course_offerings
      ? '/course_offerings/self_paced_pl_course_offerings_for_workshops'
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

  if (
    !fields.name &&
    !fields.grades &&
    !fields.subject &&
    !fields.prereq &&
    !fields.capacity &&
    !fields.description &&
    !fields.course_offerings
  ) {
    return null;
  }

  return (
    <section>
      <Heading2 visualAppearance="heading-sm">Workshop Basics</Heading2>
      {(fields.name || fields.grades || fields.subject) && (
        <div className={commonStyles.row}>
          {fields.name && (
            <TextField
              name={fields.name.stateKey}
              onChange={handleChange}
              value={name}
              label={fields.name.label}
              size="s"
              className={classNames(commonStyles.item, commonStyles.textField, {
                [commonStyles.required]: fields.name.required,
              })}
              helperMessage={fields.name.helperMessage}
              errorMessage={errors.name}
            />
          )}
          {fields.grades && (
            <CheckboxDropdown
              name={fields.grades.stateKey}
              onChange={handleGradesChange}
              styleAsFormField={true}
              hideControls
              checkedOptions={grades}
              allOptions={WorkshopGradeLevels.map((value: string) => ({
                value,
                label: value,
              }))}
              labelText={fields.grades.label}
              size="s"
              helperMessage={fields.grades.helperMessage}
              className={classNames(
                commonStyles.item,
                commonStyles.customDropdown,
                {
                  [commonStyles.required]: fields.grades.required,
                }
              )}
              errorMessage={errors.grades}
            />
          )}
          {fields.subject && (
            <SimpleDropdown
              name={fields.subject.stateKey}
              onChange={handleChange}
              styleAsFormField={true}
              items={subjectOptions}
              selectedValue={subject}
              labelText={fields.subject.label}
              size="s"
              dropdownTextThickness="thin"
              className={classNames(
                commonStyles.item,
                commonStyles.simpleDropdown,
                {
                  [commonStyles.required]: fields.subject.required,
                  [commonStyles.error]: errors.subject,
                }
              )}
              errorMessage={errors.subject}
            />
          )}
        </div>
      )}
      {(fields.prereq || fields.capacity) && (
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
              labelText={fields.prereq.label}
              helperMessage={fields.prereq.helperMessage}
              size="s"
              dropdownTextThickness="thin"
              className={classNames(
                commonStyles.item,
                commonStyles.simpleDropdown,
                commonStyles.required
              )}
            />
          )}
          {fields.capacity && (
            <TextField
              inputType="number"
              name={fields.capacity.stateKey}
              onChange={handleChange}
              value={capacity?.toString()}
              label={fields.capacity.label}
              helperMessage={fields.capacity.helperMessage}
              size="s"
              className={classNames(commonStyles.item, commonStyles.textField, {
                [commonStyles.required]: fields.capacity.required,
              })}
              errorMessage={errors.capacity}
              min={1}
            />
          )}
          {/* empty space aligns with optional subject */}
          {fields.subject && <div className={commonStyles.item} />}
        </div>
      )}
      {fields.prereq && hasPrereq && (
        <div className={commonStyles.card}>
          <div className={commonStyles.row}>
            <TextField
              name={fields.prereq.stateKey}
              onChange={handleChange}
              value={prereq}
              label="Workshop prerequisites"
              size="s"
              className={classNames(
                commonStyles.item,
                commonStyles.textField,
                commonStyles.required
              )}
              errorMessage={errors.prereq}
            />
          </div>
        </div>
      )}
      {fields.description && (
        <div className={commonStyles.row}>
          <FormFieldWrapper
            label={fields.description.label}
            helperMessage={fields.description.helperMessage}
            size="s"
            className={classNames(commonStyles.item, commonStyles.textField, {
              [commonStyles.required]: fields.description.required,
              [commonStyles.error]: errors.description,
            })}
            errorMessage={errors.description}
          >
            <textarea
              id="description"
              name={fields.description.stateKey}
              onChange={handleChange}
              value={description}
              placeholder="Enter description here"
            />
          </FormFieldWrapper>
        </div>
      )}
      {fields.course_offerings && (
        <div className={commonStyles.row}>
          <div
            className={classNames(
              commonStyles.col,
              commonStyles.plTopicsContainer
            )}
          >
            <CheckboxDropdown
              name={fields.course_offerings.stateKey}
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
              labelText={fields.course_offerings.label}
              size="s"
              className={classNames(
                commonStyles.item,
                commonStyles.customDropdown,
                {
                  [commonStyles.required]: fields.course_offerings.required,
                }
              )}
              errorMessage={errors.courseOfferings}
            />
            {courseOfferingsById && courseOfferings.length > 0 && (
              <Tags
                size="s"
                className={commonStyles.wrapContainer}
                tagsList={courseOfferings.map(offeringId => ({
                  type: 'closable',
                  onClose: handleRemoveCourseOffering(offeringId),
                  key: offeringId,
                  label:
                    courseOfferingsById[Number(offeringId)]?.display_name ?? '',
                }))}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default memo(Basics);
