import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {FC, useMemo} from 'react';

import {MultiSelectInput} from '../components/MultiSelectInput';
import {SectionProps} from '../types';

import commonStyles from '../styles.module.scss';

export const PartnerFacilitator: FC<SectionProps> = ({
  config: {
    fields: {regional_partner_id, facilitators},
  },
  state,
  handleChange,
  regionalPartners,
  facilitators: fetchedFacilitators,
}) => {
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

  const facilitatorOptions = useMemo(() => {
    return fetchedFacilitators?.map(({id, name, email}) => ({
      id,
      label: name,
      secondaryLabel: email,
      searchText: [name, email],
    }));
  }, [fetchedFacilitators]);

  return (
    <>
      <Heading2 visualAppearance="heading-sm">
        Partner and Facilitator Information
      </Heading2>
      <div className={commonStyles.row}>
        {regional_partner_id && (
          <SimpleDropdown
            name="regional_partner_id"
            onChange={e =>
              handleChange({
                regionalPartnerId: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            styleAsFormField={true}
            items={regionalPartnerOptions}
            selectedValue={state.regionalPartnerId?.toString() ?? ''}
            labelText="Regional partner"
            size="s"
            dropdownTextThickness="thin"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: regional_partner_id.required,
            })}
          />
        )}
        {facilitators && (
          <MultiSelectInput
            label="Select facilitator(s)"
            options={facilitatorOptions ?? []}
            selectedOptions={state.facilitators}
            setSelectedOptions={newFacilitators =>
              handleChange({facilitators: newFacilitators.map(Number)})
            }
            placeholder={
              state.facilitators.length
                ? 'Type to filter'
                : 'Enter name or email'
            }
          />
        )}
      </div>
    </>
  );
};
