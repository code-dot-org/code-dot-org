import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, memo, useMemo} from 'react';

import {
  SectionProps,
  WorkshopFormState,
  WorkshopErrors,
} from '../../workshops/types';

import commonStyles from '../styles.module.scss';

type AdditionalInfoKeys = 'fee' | 'participantGroupType' | 'notes';

export interface AdditionalInfoProps
  extends SectionProps,
    Pick<WorkshopFormState, AdditionalInfoKeys> {
  errors: WorkshopErrors;
}

export const AdditionalInfo: FC<AdditionalInfoProps> = ({
  config: {fields},
  fee,
  participantGroupType,
  notes,
  errors,
  dispatchWorkshop,
}) => {
  const participantGroupTypeOptions = useMemo(() => {
    return [
      {value: '', text: 'Select a cohort type'},
      ...(fields.participant_group_type?.options ?? []).map(
        ({value, label}) => ({
          value,
          text: label,
        })
      ),
    ];
  }, [fields.participant_group_type?.options]);

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

  if (!fields.fee && !fields.participant_group_type && !fields.notes) {
    return null;
  }

  return (
    <section>
      <Heading2 visualAppearance="heading-sm">Additional Information</Heading2>
      {(fields.fee || fields.participant_group_type) && (
        <div className={commonStyles.row}>
          {fields.fee && (
            <TextField
              name={fields.fee.stateKey}
              helperMessage={fields.fee.helperMessage}
              onChange={handleChange}
              value={fee}
              label={fields.fee.label}
              size="s"
              className={classNames(commonStyles.item, commonStyles.textField, {
                [commonStyles.required]: fields.fee.required,
              })}
              errorMessage={errors.fee}
            />
          )}
          {fields.participant_group_type ? (
            <SimpleDropdown
              name={fields.participant_group_type.stateKey}
              onChange={handleChange}
              styleAsFormField={true}
              items={participantGroupTypeOptions}
              selectedValue={participantGroupType}
              labelText={fields.participant_group_type.label}
              size="s"
              dropdownTextThickness="thin"
              className={classNames(
                commonStyles.item,
                commonStyles.simpleDropdown,
                {
                  [commonStyles.required]:
                    fields.participant_group_type.required,
                  [commonStyles.error]: errors.participantGroupType,
                }
              )}
              errorMessage={errors.participantGroupType}
            />
          ) : (
            <div className={commonStyles.item} />
          )}
        </div>
      )}
      {fields.notes && (
        <div className={commonStyles.row}>
          <FormFieldWrapper
            label={fields.notes.label}
            helperMessage={fields.notes.helperMessage}
            size="s"
            className={classNames(commonStyles.item, commonStyles.textField, {
              [commonStyles.required]: fields.notes.required,
              [commonStyles.error]: errors.notes,
            })}
            errorMessage={errors.notes}
          >
            <textarea
              id="notes"
              name={fields.notes.stateKey}
              onChange={handleChange}
              value={notes}
              placeholder="Enter attendee notes here"
            />
          </FormFieldWrapper>
        </div>
      )}
    </section>
  );
};

export default memo(AdditionalInfo);
