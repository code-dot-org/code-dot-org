import React from 'react';
import {render, screen} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
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

    expect(screen.queryByTitle('Share to LinkedIn')).to.not.exist;

    expect(screen.queryByTitle('Share to Facebook')).to.exist;
    expect(screen.getByTitle('Share to Facebook').closest('a').href).to.equal(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );

    expect(screen.queryByTitle('Share to Twitter')).to.exist;
    expect(screen.getByTitle('Share to Twitter').closest('a').href).to.equal(
      'https://twitter.com/share?twitter'
    );

    expect(screen.getByText('Print').closest('a').href).to.include('/print');
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

    expect(screen.queryByTitle('Share to LinkedIn')).to.exist;
    expect(screen.getByTitle('Share to LinkedIn').closest('a').href).to.equal(
      'https://www.linkedin.com/sharing/share-offsite/?linkedin'
    );

    expect(screen.queryByTitle('Share to Facebook')).to.exist;
    expect(screen.getByTitle('Share to Facebook').closest('a').href).to.equal(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );

    expect(screen.queryByTitle('Share to Twitter')).to.exist;
    expect(screen.getByTitle('Share to Twitter').closest('a').href).to.equal(
      'https://twitter.com/share?twitter'
    );

    expect(screen.getByText('Print').closest('a').href).to.include('/print');
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

    expect(screen.queryByTitle('Share to LinkedIn')).to.not.exist;
    expect(screen.queryByTitle('Share to Facebook')).to.not.exist;
    expect(screen.queryByTitle('Share to Twitter')).to.not.exist;

    expect(screen.getByText('Print').closest('a').href).to.include('/print');
  });
});
