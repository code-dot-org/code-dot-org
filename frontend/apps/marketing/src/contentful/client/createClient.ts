import axios from 'axios';
import {buildMemoryStorage, setupCache} from 'axios-cache-interceptor';
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

/**
 * Updates the Contentful Axios instance with axios caching
 */
const OLD_CACHE_ENTRIES_CLEAN_INTERVAL_MILLISECONDS = 1000 * 60 * 60 * 24; // 1 day
const CACHE_ENTRY_TTL = 1000 * 60 * 1; // 15 minutes
const uncachedAxiosCreate = axios.create;

axios.create = function (...args) {
  const instance = uncachedAxiosCreate.apply(this, args);

  return setupCache(instance, {
    storage: buildMemoryStorage(
      true,
      OLD_CACHE_ENTRIES_CLEAN_INTERVAL_MILLISECONDS,
    ),
    ttl: CACHE_ENTRY_TTL,
  });
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

  const client = createClient(contentfulClientProps);

  return client;
}
