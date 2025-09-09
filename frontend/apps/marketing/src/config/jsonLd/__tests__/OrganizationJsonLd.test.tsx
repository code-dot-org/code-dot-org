import {render} from '@testing-library/react';

import {Brand} from '@/config/brand';
import OrganizationJsonLd from '@/config/jsonLd/OrganizationJsonLd';

describe('OrganizationJsonLd', () => {
  const queryScript = () =>
    document.querySelector('script[type="application/ld+json"]');

  it('renders correct JSON-LD script for CODE_DOT_ORG', () => {
    render(<OrganizationJsonLd brand={Brand.CODE_DOT_ORG} />);

    const script = queryScript();

    expect(script).toBeInTheDocument();
    expect(script).toHaveTextContent(
      '"@type":"EducationalOrganization","name":"Code.org"',
    );
  });

  it('renders nothing for HOUR_OF_CODE', () => {
    render(<OrganizationJsonLd brand={Brand.HOUR_OF_CODE} />);

    const script = queryScript();

    expect(script).not.toBeInTheDocument();
  });
});
