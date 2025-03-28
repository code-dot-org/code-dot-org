import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, useMemo} from 'react';

import {ParticipantGroupTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {AdditionalInfoProps} from '../types';

import commonStyles from '../styles.module.scss';

export const AdditionalInfo: FC<AdditionalInfoProps> = ({
  config: {fields},
  fee,
  participantGroupType,
  notes,
  dispatchWorkshop,
}) => {
  const participantGroupTypeOptions = useMemo(() => {
    return [
      {value: '', text: 'Select a cohort type'},
      ...ParticipantGroupTypes.map(value => ({
        value,
        text: value,
      })),
    ];
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    dispatchWorkshop({
      type: 'UPDATE_WORKSHOP',
      payload: {[event.target.name]: event.target.value},
    });
  };
  return (
    <>
      <Heading2 visualAppearance="heading-sm">Additional Information</Heading2>
      <div className={commonStyles.row}>
        {fields.fee && (
          <TextField
            name="fee"
            helperMessage="You can leave this field blank if the workshop is free"
            onChange={handleChange}
            value={fee}
            label="Workshop cost"
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.fee.required,
            })}
          />
        )}
        {fields.participant_group_type ? (
          <SimpleDropdown
            name="participantGroupType"
            onChange={handleChange}
            styleAsFormField={true}
            items={participantGroupTypeOptions}
            selectedValue={participantGroupType}
            labelText="Cohort type"
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.participant_group_type.required,
            })}
          />
        ) : (
          <div className={commonStyles.item} />
        )}
      </div>
      <div className={commonStyles.row}>
        {fields.notes && (
          <FormFieldWrapper
            label="Attendee notes"
            helperMessage="Notes for logistics like food, parking, or other event details."
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.notes.required,
            })}
          >
            <textarea
              id="notes"
              name="notes"
              onChange={handleChange}
              value={notes}
              placeholder="Enter attendee notes here"
            />
          </FormFieldWrapper>
        )}
      </div>
    </>
  );
};
