import {EntryFields} from 'contentful';
import {useMemo} from 'react';

import IconHighlight, {
  IconHighlightLinkProps,
} from '@code-dot-org/component-library/cms/iconHighlight';

import {fontAwesomeV6BrandIconsMap} from '@/components/common/constants';
import {LinkEntry} from '@/types/contentful/entries/Link';

export interface IconHighlightContentfulProps {
  heading: EntryFields.Text;
  text: EntryFields.Text;
  iconName: EntryFields.Text;
  linkEntry?: LinkEntry;
  linkEntries?: LinkEntry[];
}

const IconHighlightContentful: React.FunctionComponent<
  IconHighlightContentfulProps
> = ({heading, text, iconName, linkEntry, linkEntries = []}) => {
  const links: IconHighlightLinkProps[] = useMemo(() => {
    const links: LinkEntry[] = linkEntries.filter(Boolean);

    if (!links.length && linkEntry) links.push(linkEntry);

    return links.map(linkEntry => ({
      key: linkEntry.sys.id,
      text: linkEntry.fields.label,
      href: linkEntry.fields.primaryTarget,
      external: linkEntry.fields.isThisAnExternalLink,
      target: linkEntry.fields.isThisAnExternalLink ? '_blank' : undefined,
      'aria-label': linkEntry.fields.ariaLabel || undefined,
    }));
  }, [linkEntry, linkEntries]);

  return (
    <IconHighlight
      heading={heading}
      text={text}
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
