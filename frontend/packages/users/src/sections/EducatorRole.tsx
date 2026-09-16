import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Field, useField} from '@code-dot-org/component-library/form';
import type {EducatorRoleOption} from '@code-dot-org/core/api';

import Section from './Section';
import type {SectionProps} from './types';

// Display order and headings for the server's `category`, which is an open
// string: a category Rails adds later falls into the last group rather than
// disappearing.
const CATEGORIES: [category: string, label: string][] = [
  ['educator', 'Educator'],
  ['admin', 'Administrator'],
  ['other', 'Other'],
];

const LAST_CATEGORY = CATEGORIES[CATEGORIES.length - 1][0];

function groupByCategory(options: EducatorRoleOption[]) {
  const known = new Set(CATEGORIES.map(([category]) => category));
  const bucket = (option: EducatorRoleOption) =>
    known.has(option.category) ? option.category : LAST_CATEGORY;

  return CATEGORIES.map(([category, label]) => ({
    label,
    groupItems: options
      .filter(option => bucket(option) === category)
      .map(({value, text}) => ({value, text})),
  })).filter(group => group.groupItems.length > 0);
}

/**
 * The "Role" section. A role, once set, can never be cleared, so the blank
 * placeholder is disabled while unset and gone once a role is stored.
 */
export default function EducatorRole({settings}: SectionProps) {
  const educatorRole = useField('educator_role');
  const groups = groupByCategory(settings.educatorRoleOptions ?? []);

  // Keyed off the stored role, not the field, so picking a role doesn't drop an
  // option out from under an open dropdown.
  const itemGroups = settings.educatorRole
    ? groups
    : [
        {
          label: '',
          groupItems: [{value: '', text: 'Select a role', disabled: true}],
        },
        ...groups,
      ];

  return (
    <Section id="educator-role" title="Role">
      <Field>
        <SimpleDropdown
          name="educator_role"
          labelText="Educator role"
          itemGroups={itemGroups}
          selectedValue={educatorRole.value}
          onChange={event => educatorRole.onChange(event.target.value)}
          errorMessage={educatorRole.errors[0]}
          styleAsFormField
        />
      </Field>
    </Section>
  );
}
