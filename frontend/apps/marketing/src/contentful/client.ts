import {createClient} from 'contentful';

/**
 * For values and documentation, please refer to .env.example
 */
const clientProps = {
  space: process.env.CONTENTFUL_SPACE_ID!,
  environment: process.env.CONTENTFUL_ENV_ID,
  host: process.env.CONTENTFUL_API_HOST,
  accessToken: process.env.CONTENTFUL_TOKEN!,
};

/**
 * Check if all the required environment variables are available.
 * If not, the client will not be created.
 */
const isEnvironmentAvailable = Object.values(clientProps).every(
  value => !!value,
);

if (!isEnvironmentAvailable) {
  console.warn(
    'Contentful client is not available, no content will be fetched from Contentful.',
  );
}

export default isEnvironmentAvailable ? createClient(clientProps) : undefined;
