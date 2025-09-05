import {getContentfulClient} from '@/contentful/client';

import {LinkItemProps} from '../common/types';

// Function to create a link item used in the Header
export const createLinkItem = (
  link: LinkItemProps,
  overrides: Partial<LinkItemProps> = {},
): LinkItemProps => ({
  id: link.href?.replace(/\//g, '-') || 'home',
  label: link.label,
  href: link.href,
  ...overrides,
});

// Function to fetch links from a Contentful entry by its ID
export async function getLinksFromEntry(entryId: string) {
  const client = getContentfulClient();
  console.log('Contentful client:', client);

  try {
    console.log('Requesting entry ID:', entryId);

    const entry = await client?.getEntry(entryId);
    console.log('Retrieved entry:', entry);
    console.log('Entry fields:', entry?.fields);

    const links = Array.isArray(entry?.fields.itemsInThisList)
      ? entry.fields.itemsInThisList
      : [];

    // Remove before committing
    console.log('Extracted links:', links);

    // Figure out if I need to use useInMemoryEntities
    // here in some way once the client is available.
    // Using this any type for now, will replace.
    // eslint-disable-next-line
    return links.map((link: any) => ({
      href: link.fields.primaryTarget,
      label: link.fields.label,
    }));
  } catch (error) {
    console.error('Error fetching entry:', error);
    return [];
  }
}
