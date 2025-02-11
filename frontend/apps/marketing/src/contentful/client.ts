import {createClient} from 'contentful';

type ClientProps = {
  space: string;
  environment?: string;
  host?: string;
  accessToken: string;
};

/**
 * For values and documentation, please refer to .env.example
 */
const clientProps: ClientProps = {
  space: process.env.CONTENTFUL_SPACE_ID!,
  environment: process.env.CONTENTFUL_ENV_ID,
  host: process.env.CONTENTFUL_API_HOST,
  accessToken: process.env.CONTENTFUL_TOKEN!,
};

function getContentfulClient(props: ClientProps) {
  /**
   * Check if all the required environment variables are available.
   * If not, the client will not be created.
   */
  const isEnvironmentAvailable = Object.values(props).every(value => !!value);

  if (!isEnvironmentAvailable) {
    console.warn(
      '⚠️ Contentful client is not available, no content will be fetched from Contentful. Please check that frontend/apps/marketing/.env is populated.',
    );
  }

  return isEnvironmentAvailable ? createClient(props) : undefined;
}

// Exported for unit testing only
export const _private = {
  getContentfulClient,
};

export default getContentfulClient(clientProps);
