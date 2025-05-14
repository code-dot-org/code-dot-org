import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, memo, useCallback, useMemo} from 'react';

import {MultiSelectInput, OptionId} from '../components/MultiSelectInput';
import {PartnerFacilitatorProps} from '../types';

import commonStyles from '../styles.module.scss';

export const PartnerFacilitator: FC<PartnerFacilitatorProps> = ({
  config: {fields},
  facilitators,
  regionalPartnerId,
  errors,
  dispatchWorkshop,
  regionalPartnerData,
  facilitatorData,
}) => {
  const regionalPartnerOptions = useMemo(() => {
    const options = [{value: '', text: 'None'}];

    regionalPartnerData?.forEach(({id, name}) => {
      options.push({
        value: id.toString(),
        text: name,
      });
    });

    return options;
  }, [regionalPartnerData]);

  const facilitatorOptions = useMemo(
    () =>
      facilitatorData?.map(({id, name, email}) => ({
        id,
        label: name,
        secondaryLabel: email,
        searchText: [name, email],
      })) ?? [],
    [facilitatorData]
  );

  const handleFacilitators = useCallback(
    (newFacilitators: OptionId[]) => {
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {facilitators: newFacilitators.map(Number)},
      });
    },
    [dispatchWorkshop]
  );

  const handleRegionalPartner = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {
          regionalPartnerId: event.target.value
            ? Number(event.target.value)
            : null,
        },
      });
    },
    [dispatchWorkshop]
  );

  if (!fields.facilitators && !fields.regional_partner_id) {
    return null;
  }

  return (
    <section>
      <Heading2 visualAppearance="heading-sm">
        Partner and Facilitator Information
      </Heading2>
      {(fields.regional_partner_id || fields.facilitators) && (
        <div className={commonStyles.row}>
          {fields.regional_partner_id && (
            <SimpleDropdown
              name={fields.regional_partner_id.stateKey}
              onChange={handleRegionalPartner}
              styleAsFormField={true}
              items={regionalPartnerOptions}
              selectedValue={regionalPartnerId?.toString() ?? ''}
              labelText={fields.regional_partner_id.label}
              size="s"
              dropdownTextThickness="thin"
              className={classNames(
                commonStyles.item,
                commonStyles.simpleDropdown,
                {
                  [commonStyles.required]: fields.regional_partner_id.required,
                  [commonStyles.error]: errors.regionalPartnerId,
                }
              )}
              errorMessage={errors.regionalPartnerId}
            />
          )}
          {fields.facilitators && (
            <div
              className={classNames(
                commonStyles.item,
                commonStyles.multiSelect,
                {
                  [commonStyles.error]: errors.facilitators,
                }
              )}
            >
              <MultiSelectInput
                name={fields.facilitators.stateKey}
                label={fields.facilitators.label}
                options={facilitatorOptions}
                selectedOptions={facilitators}
                setSelectedOptions={handleFacilitators}
                placeholder={
                  facilitators.length ? 'Type to filter' : 'Enter name or email'
                }
                errorMessage={errors.facilitators}
                size="s"
                className={classNames({
                  [commonStyles.required]: fields.facilitators.required,
                })}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default memo(PartnerFacilitator);
