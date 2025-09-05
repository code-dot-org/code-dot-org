import {getContentfulClient} from '@/contentful/client';

// Function to fetch CSforAll dropdown links from a Contentful entry by its ID
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
