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
