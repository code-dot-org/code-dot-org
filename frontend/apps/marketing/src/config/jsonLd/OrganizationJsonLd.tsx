import {JsonLd} from 'react-schemaorg';
import {WithContext, EducationalOrganization} from 'schema-dts';

import {Brand} from '@/config/brand';

/** See: https://developers.google.com/search/docs/appearance/structured-data/organization */
const BRANDS_ORG_JSON_LD: {
  [K in Brand]?: WithContext<EducationalOrganization>;
} = {
  [Brand.CODE_DOT_ORG]: {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Code.org',
    alternateName: 'Code Dot Org',
    url: 'https://code.org',
    logo: 'https://images.ctfassets.net/90t6bu6vlf76/2JhHPaRQiMUbjidN4gKuY2/c43817ca968471f1c0811d725025ee64/WordmarkS_Black_Solid.svg',
    description:
      'Code.org® is an education innovation nonprofit dedicated to the vision ' +
      'that every student in every school has the opportunity to learn computer science ' +
      'and artificial intelligence as part of their core K-12 education. ' +
      'We expand access to and participation in computer science in schools, ' +
      'with a focus on increasing participation by young women and students from other underrepresented groups. ' +
      'The leading provider of K-12 computer science curriculum in the largest school districts ' +
      'in the United States, Code.org also organizes the annual Hour of Code campaign, ' +
      'which has engaged more than 15% of all students in the world. ' +
      'Code.org is supported by generous donors including Microsoft, Amazon, Google and many others.',
    nonprofitStatus: 'Nonprofit501c3',
    taxID: '46-0858543',
    foundingDate: '2013',
    founder: [
      {
        '@type': 'Person',
        name: 'Hadi Partovi',
        jobTitle: 'CEO',
      },
      {
        '@type': 'Person',
        name: 'Ali Partovi',
        jobTitle: 'Co-Founder',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'WA',
      addressLocality: 'Seattle',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Help center',
      email: 'support@code.org',
      url: 'https://support.code.org/hc/requests/new',
    },
    sameAs: [
      'https://facebook.com/Code.org',
      'https://x.com/codeorg',
      'https://instagram.com/codeorg',
      'https://codeorg.medium.com',
      'https://youtube.com/codeorg',
      'https://linkedin.com/company/code-dot-org',
      'https://en.wikipedia.org/wiki/Code.org',
      'https://github.com/code-dot-org',
    ],
  },
};

interface OrganizationJsonLdProps {
  brand: Brand;
}

const OrganizationJsonLd: React.FC<OrganizationJsonLdProps> = ({brand}) =>
  BRANDS_ORG_JSON_LD[brand] && <JsonLd item={BRANDS_ORG_JSON_LD[brand]} />;

export default OrganizationJsonLd;
