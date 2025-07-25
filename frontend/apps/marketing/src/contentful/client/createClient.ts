import axios from 'axios';
import {createClient, CreateClientParams} from 'contentful';

type ClientProps = {
  space: string;
  environment?: string;
};

type ClientType = 'preview' | 'delivery';

/**
 * For values and documentation, please refer to .env.example
 */
const clientProps: ClientProps = {
  space: process.env.CONTENTFUL_SPACE_ID!,
  environment: process.env.CONTENTFUL_ENV_ID,
};

function getContentfulClientProps(clientType: ClientType): CreateClientParams {
  return {
    space: clientProps.space,
    environment: clientProps.environment,
    accessToken:
      clientType === 'preview'
        ? process.env.CONTENTFUL_PREVIEW_TOKEN!
        : process.env.CONTENTFUL_DELIVERY_TOKEN!,
    host:
      clientType === 'preview'
        ? 'preview.contentful.com'
        : 'cdn.contentful.com',
    adapter: config => {
      // Pull out the system id for Contentful entries from the URL parameters
      // These system ids are used as the cache key for the Contentful requests
      // Fetch is then cached using the Next.js/redis cache system
      // See: https://nextjs.org/docs/app/getting-started/caching-and-revalidating#fetch
      const contentfulSystemIds: string = config.params?.['sys.id[in]'];
      const contentfulSystemIdTags = contentfulSystemIds?.split(',');

      const tags = [];

      // When making a request to Contentful, add all the system ids (entry id, asset id, etc.) as a cache key tag
      // When a webhook is published from Contentful, the cache will be invalidated for all entries with these system ids
      if (contentfulSystemIdTags) {
        tags.push(...contentfulSystemIdTags);
      }

      // If requesting for all entries of a specific content type, add the content type as a tag
      // When a webhook is published from Contentful, the cache will be invalidated for all entries of this content type
      if (config.params['content_type']) {
        tags.push(config.params['content_type']);
      }

      // Clone the config to avoid mutation
      // Then ensure Contentful requests are cached
      const modifiedConfig = {
        ...config,
        fetchOptions: {
          ...config.fetchOptions,
          cache: 'force-cache',
          next: {
            revalidate: 900, // Cache for 15 minutes
            tags,
          },
        },
      };

      return axios.getAdapter('fetch')(modifiedConfig);
    },
  };
}

export {getContentfulClientProps};

export function createContentfulClient(clientType: ClientType) {
  /**
   * Check if all the required environment variables are available.
   * If not, the client will not be created.
   */
  const isEnvironmentAvailable = Object.values(clientProps).every(
    value => !!value,
  );

  const contentfulClientProps = getContentfulClientProps(clientType);

  if (!isEnvironmentAvailable || !contentfulClientProps.accessToken) {
    console.warn(
      `⚠️ Contentful ${clientType} client is not available, no ${clientType} content will be fetched from Contentful. Please check that frontend/apps/marketing/.env is populated.`,
    );
    return undefined;
  }

  return createClient(contentfulClientProps);
}
