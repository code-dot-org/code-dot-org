import {EntryFields} from 'contentful';
import {useMemo} from 'react';

import IconHighlight, {
  IconHighlightLinkProps,
  IconHighlightProps,
} from '@code-dot-org/component-library/cms/iconHighlight';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';

export type IconHighlightContentfulLinkEntry = {
  sys: {
    id: EntryFields.Text;
  };
  fields: {
    label: EntryFields.Text;
    primaryTarget: EntryFields.Text;
    ariaLabel?: EntryFields.Text;
    isThisAnExternalLink?: EntryFields.Boolean;
  };
};

export interface IconHighlightContentfulProps extends IconHighlightProps {
  iconName: EntryFields.Text;
  linkEntries?: IconHighlightContentfulLinkEntry[];
}

const IconHighlightContentful: React.FunctionComponent<
  IconHighlightContentfulProps
> = ({iconName, linkEntries = [], ...props}) => {
  const links: IconHighlightLinkProps[] = useMemo(
    () =>
      linkEntries.filter(Boolean).map(linkEntry => ({
        key: linkEntry.sys.id,
        text: linkEntry.fields.label,
        href: linkEntry.fields.primaryTarget,
        external: linkEntry.fields.isThisAnExternalLink,
        target: linkEntry.fields.isThisAnExternalLink ? '_blank' : undefined,
        'aria-label': linkEntry.fields.ariaLabel || undefined,
      })),
    [linkEntries],
  );

  return (
    <IconHighlight
      {...props}
      links={links}
      icon={{
        iconName,
        iconStyle: 'solid',
        iconFamily: fontAwesomeV6BrandIconsMap.has(iconName)
          ? 'brands'
          : undefined,
      }}
    />
  );
};

export default IconHighlightContentful;
