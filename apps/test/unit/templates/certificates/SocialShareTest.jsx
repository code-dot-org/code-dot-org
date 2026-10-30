import {render, screen} from '@testing-library/react';
import React from 'react';

import SocialShare from '@cdo/apps/templates/certificates/SocialShare';

describe('SocialShare', () => {
  // SocialShare uses a function from url_test.js to check if images are accessible
  // before loading buttons. This is a slightly hacky way of resolving that function.
  const resolveImageAccess = () => {
    window.testImages?.forEach(image => image.onload());
  };

  it('renders facebook and twitter share buttons when isPlCourse is false', () => {
    render(
      <SocialShare
        facebook="facebook"
        twitter="twitter"
        linkedin="linkedin"
        print="print"
        under13={false}
        isPlCourse={false}
      />
    );

    resolveImageAccess();

    expect(screen.queryByTitle('Share to LinkedIn')).toBeFalsy();

    expect(screen.queryByTitle('Share to Facebook')).toBeDefined();
    expect(screen.getByTitle('Share to Facebook').closest('a').href).toBe(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );

    expect(screen.queryByTitle('Share to Twitter')).toBeDefined();
    expect(screen.getByTitle('Share to Twitter').closest('a').href).toBe(
      'https://twitter.com/share?twitter'
    );

    expect(screen.getByText('Print').closest('a').href).toContain('/print');
  });

  it('renders linkedin share button when isPlCourse is true', () => {
    render(
      <SocialShare
        facebook="facebook"
        twitter="twitter"
        linkedin="linkedin"
        print="/print"
        under13={false}
        isPlCourse={true}
      />
    );

    resolveImageAccess();

    expect(screen.queryByTitle('Share to LinkedIn')).toBeDefined();
    expect(screen.getByTitle('Share to LinkedIn').closest('a').href).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?linkedin'
    );

    expect(screen.queryByTitle('Share to Facebook')).toBeDefined();
    expect(screen.getByTitle('Share to Facebook').closest('a').href).toBe(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );

    expect(screen.queryByTitle('Share to Twitter')).toBeDefined();
    expect(screen.getByTitle('Share to Twitter').closest('a').href).toBe(
      'https://twitter.com/share?twitter'
    );

    expect(screen.getByText('Print').closest('a').href).toContain('/print');
  });

  it('does not render social share buttons when under13 is true', () => {
    render(
      <SocialShare
        facebook="facebook"
        twitter="twitter"
        linkedin="linkedin"
        print="/print"
        under13={true}
        isPlCourse={false}
      />
    );

    resolveImageAccess();

    expect(screen.queryByTitle('Share to LinkedIn')).toBeFalsy();
    expect(screen.queryByTitle('Share to Facebook')).toBeFalsy();
    expect(screen.queryByTitle('Share to Twitter')).toBeFalsy();

    expect(screen.getByText('Print').closest('a').href).toContain('/print');
  });
});
