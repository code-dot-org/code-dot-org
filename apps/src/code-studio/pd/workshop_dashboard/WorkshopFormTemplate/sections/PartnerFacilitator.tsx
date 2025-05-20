import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {FC, memo, useCallback, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';

import {useFetch} from '@cdo/apps/util/useFetch';

import {MultiSelectInput, OptionId} from '../components/MultiSelectInput';
import {
  Facilitator,
  PartnerFacilitatorProps,
  PotentialOrganizer,
  RegionalPartner,
} from '../types';

import commonStyles from '../styles.module.scss';

export const PartnerFacilitator: FC<PartnerFacilitatorProps> = ({
  config: {fields, label},
  facilitators,
  regionalPartnerId,
  errors,
  dispatchWorkshop,
  organizerId,
}) => {
  const {workshopId} = useParams();
  const {data: organizerData} = useFetch<PotentialOrganizer[]>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}/potential_organizers` : ''
  );

  const {data: facilitatorData} = useFetch<Facilitator[]>(
    label
      ? `/api/v1/pd/course_facilitators?course=${encodeURIComponent(label)}`
      : ''
  );

  const regionalPartnerData = useSelector(
    ({
      regionalPartners: {regionalPartners},
    }: {
      regionalPartners: {regionalPartners: RegionalPartner[]};
    }) => regionalPartners
  );

  useEffect(() => {
    if (regionalPartnerData?.length === 1) {
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {
          regionalPartnerId: regionalPartnerData[0].id,
        },
      });
    }
  }, [regionalPartnerData, dispatchWorkshop]);

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

  const organizerOptions = useMemo(
    () =>
      organizerData?.map(({value, label}) => ({
        value: value.toString(),
        text: label,
      })) ?? [],
    [organizerData]
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const {name, value} = e.target;
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {
          [name]: value && !isNaN(Number(value)) ? Number(value) : null,
        },
      });
    },
    [dispatchWorkshop]
  );

  if (
    !fields.facilitators &&
    !fields.regional_partner_id &&
    !fields.organizer_id
  ) {
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
              onChange={handleChange}
              styleAsFormField={true}
              items={regionalPartnerOptions}
              selectedValue={regionalPartnerId?.toString()}
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
      {fields.organizer_id && !!organizerData?.length && (
        <div className={commonStyles.row}>
          <SimpleDropdown
            name={fields.organizer_id.stateKey}
            onChange={handleChange}
            styleAsFormField={true}
            items={organizerOptions}
            selectedValue={organizerId?.toString()}
            labelText={fields.organizer_id.label}
            size="s"
            dropdownTextThickness="thin"
            className={classNames(
              commonStyles.item,
              commonStyles.simpleDropdown,
              {
                [commonStyles.required]: fields.organizer_id.required,
                [commonStyles.error]: errors.organizerId,
              }
            )}
            errorMessage={errors.organizerId}
          />
          <div className={commonStyles.item} />
        </div>
      )}
    </section>
  );
};

export default memo(PartnerFacilitator);
