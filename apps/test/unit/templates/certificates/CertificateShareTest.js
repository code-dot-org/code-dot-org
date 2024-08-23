import {render, screen, within} from '@testing-library/react';
import React from 'react';

import CertificateShare from '@cdo/apps/templates/certificates/CertificateShare';

const defaultImageAlt = 'certificate alt text';
const defaultProps = {
  imageUrl: '/certificate-image',
  imageAlt: defaultImageAlt,
  printUrl: '/certificate-print',
  announcement: {
    image: '/announcement-image',
    title: 'Title Text',
    body: 'body text',
    buttonId: 'button-id',
    buttonUrl: '/button-url',
    buttonText: 'button text',
  },
};

describe('CertificateShare', () => {
  let storedWindowDashboard;

  beforeEach(() => {
    storedWindowDashboard = window.dashboard;
    window.dashboard = {
      CODE_ORG_URL: '//code.org',
    };
  });

  afterEach(() => {
    window.dashboard = storedWindowDashboard;
  });

  it('renders announcement image url relative to marketing', () => {
    render(<CertificateShare {...defaultProps} />);

    const printLink = screen.getByRole('link', {name: defaultImageAlt});
    expect(printLink.href).toContain('/certificate-print');
    const image = screen.getByRole('img', {name: defaultImageAlt});
    expect(image.src).toContain('/certificate-image');

    const twoColumnActionBlock = screen.getByTestId('two-column-action-block');
    const announcementImg = within(twoColumnActionBlock).getByTestId(
      'two-column-action-block-img'
    );
    expect(announcementImg.src).toContain('//code.org/announcement-image');
  });

  it('renders no announcement without announcement prop', () => {
    const props = {
      ...defaultProps,
      announcement: null,
    };
    render(<CertificateShare {...props} />);

    screen.findByRole('link', {name: defaultImageAlt});

    expect(screen.queryByTestId('two-column-action-block')).toBeFalsy();
  });
});
