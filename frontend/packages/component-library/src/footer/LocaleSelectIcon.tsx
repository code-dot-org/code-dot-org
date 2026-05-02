import type {HTMLAttributes} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

/**
 * Chevron-down icon used as the `IconComponent` for the language NativeSelect.
 * MUI injects a `className` that positions the icon; FontAwesomeV6Icon
 * forwards it through `HTMLAttributes<HTMLElement>`.
 */
export function LocaleSelectIcon(props: HTMLAttributes<HTMLElement>) {
  return (
    <FontAwesomeV6Icon {...props} iconName="chevron-down" iconStyle="solid" />
  );
}
