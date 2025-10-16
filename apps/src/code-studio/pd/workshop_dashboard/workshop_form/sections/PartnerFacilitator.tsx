import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useParams} from 'react-router-dom';

import {CourseBuildYourOwn} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {useDebounce} from '@cdo/apps/util/hooks/useDebounce';
import {useFetch} from '@cdo/apps/util/useFetch';

import {
  PotentialOrganizer,
  Facilitator,
  RegionalPartner,
  SectionProps,
  WorkshopErrors,
  WorkshopFormState,
} from '../../workshops/types';
import {MultiSelectInput, Option} from '../components/MultiSelectInput';

import commonStyles from '../WorkshopForm.module.scss';

export const COURSE_OFFERINGS_FETCH_DEBOUNCE = 1000;

type PartnerFacilitatorKeys =
  | 'facilitators'
  | 'regionalPartnerId'
  | 'organizerId'
  | 'courseOfferings';

export interface PartnerFacilitatorProps
  extends SectionProps,
    Pick<WorkshopFormState, PartnerFacilitatorKeys> {
  errors: WorkshopErrors;
}

export const PartnerFacilitator: FC<PartnerFacilitatorProps> = ({
  config: {fields, label},
  facilitators,
  regionalPartnerId,
  courseOfferings,
  errors,
  dispatchWorkshop,
  organizerId,
}) => {
  const {workshopId} = useParams();
  const [facilitatorUrl, setFacilitatorUrl] = useState('');
  const {data: organizerData} = useFetch<PotentialOrganizer[]>(
    workshopId ? `/api/v1/pd/workshops/${workshopId}/potential_organizers` : ''
  );

  const {data: facilitatorData} = useFetch<Facilitator[]>(facilitatorUrl);

  const {data: regionalPartnerData} = useFetch<RegionalPartner[]>(
    '/api/v1/regional_partners'
  );

  const debouncedCourseOfferings = useDebounce<
    PartnerFacilitatorProps['courseOfferings']
  >(courseOfferings, COURSE_OFFERINGS_FETCH_DEBOUNCE);

  useEffect(() => {
    let url = '/api/v1/pd/course_facilitators';

    if (debouncedCourseOfferings.length) {
      const courseOfferingsParams = debouncedCourseOfferings
        .map(co => `course_offerings=${encodeURIComponent(co)}`)
        .join('&');

      url += '?' + courseOfferingsParams;
    } else if (label && label !== CourseBuildYourOwn) {
      url += `?course=${encodeURIComponent(label)}`;
    }
    setFacilitatorUrl(url);
  }, [label, debouncedCourseOfferings]);

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
    (newFacilitators: Option[]) => {
      dispatchWorkshop({
        type: 'UPDATE_WORKSHOP',
        payload: {facilitators: newFacilitators},
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
