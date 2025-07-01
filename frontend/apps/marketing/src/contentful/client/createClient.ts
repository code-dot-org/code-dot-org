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

      // Clone the config to avoid mutation
      // Then ensure Contentful requests are cached
      const modifiedConfig = {
        ...config,
        fetchOptions: {
          ...config.fetchOptions,
          cache: 'force-cache',
          next: {
            revalidate: 900, // Cache for 15 minutes
            tags: contentfulSystemIdTags,
          },
        },
      };

      return axios.getAdapter('fetch')(modifiedConfig);
    },
  };
}

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
