import {createClient} from 'contentful';

export default createClient({
  // your space id
  space: process.env.CONTENTFUL_SPACE_ID!,
  // your environment id
  environment: process.env.CONTENTFUL_ENV_ID,
  // Supported values: 'preview.contentful.com' or 'cdn.contentful.com',
  host: process.env.CONTENTFUL_API_HOST,
  // needs to be access token if host = 'cdn.contentful.com' and preview token if 'preview.contentful.com'
  accessToken: process.env.CONTENTFUL_TOKEN!,
});
