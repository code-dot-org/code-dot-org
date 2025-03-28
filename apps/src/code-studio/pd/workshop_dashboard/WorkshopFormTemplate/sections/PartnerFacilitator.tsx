import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, useCallback, useMemo} from 'react';

import {useFetch} from '@cdo/apps/util/useFetch';

import {MultiSelectInput, OptionId} from '../components/MultiSelectInput';
import {Facilitator, PartnerFacilitatorProps, RegionalPartner} from '../types';

import commonStyles from '../styles.module.scss';

export const PartnerFacilitator: FC<PartnerFacilitatorProps> = ({
  config: {label, fields},
  facilitators,
  regionalPartnerId,
  dispatchWorkshop,
}) => {
  const {data: regionalPartners} = useFetch<RegionalPartner[]>(
    '/api/v1/regional_partners'
  );

  const {data: fetchedFacilitators} = useFetch<Facilitator[]>(
    `/api/v1/pd/course_facilitators?course=${encodeURIComponent(label)}`
  );
  const regionalPartnerOptions = useMemo(() => {
    const options = [{value: '', text: 'None'}];

    regionalPartners?.forEach(({id, name}) => {
      options.push({
        value: id.toString(),
        text: name,
      });
    });

    return options;
  }, [regionalPartners]);

  const facilitatorOptions = useMemo(
    () =>
      fetchedFacilitators?.map(({id, name, email}) => ({
        id,
        label: name,
        secondaryLabel: email,
        searchText: [name, email],
      })) ?? [],
    [fetchedFacilitators]
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

  return (
    <>
      <Heading2 visualAppearance="heading-sm">
        Partner and Facilitator Information
      </Heading2>
      <div className={commonStyles.row}>
        {fields.regional_partner_id && (
          <SimpleDropdown
            name="regional_partner_id"
            onChange={handleRegionalPartner}
            styleAsFormField={true}
            items={regionalPartnerOptions}
            selectedValue={regionalPartnerId?.toString() ?? ''}
            labelText="Regional partner"
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.regional_partner_id.required,
            })}
          />
        )}
        {fields.facilitators && (
          <MultiSelectInput
            label="Select facilitator(s)"
            options={facilitatorOptions}
            selectedOptions={facilitators}
            setSelectedOptions={handleFacilitators}
            placeholder={
              facilitators.length ? 'Type to filter' : 'Enter name or email'
            }
          />
        )}
      </div>
    </>
  );
};
