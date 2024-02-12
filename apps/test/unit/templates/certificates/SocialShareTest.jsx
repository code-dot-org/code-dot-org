import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import SocialShare from '@cdo/apps/templates/certificates/SocialShare';

describe('SocialShare', () => {
  // SocialShare uses a function from url_test.js to check if images are accessible
  // before loading buttons. This is a slightly hacky way of resolving that function.
  const resolveImageAccess = () => {
    window.testImages?.forEach(image => image.onload());
  };

  it('renders facebook and twitter share buttons when isPlCourse is false', async () => {
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
    await waitFor(
      () => expect(screen.getByTitle('Share to Facebook')).to.exist
    );
    await waitFor(() => expect(screen.getByTitle('Share to Twitter')).to.exist);

    expect(screen.getByTitle('Share to Facebook').closest('a').href).to.equal(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );
    expect(screen.getByTitle('Share to Twitter').closest('a').href).to.equal(
      'https://twitter.com/share?twitter'
    );
    expect(screen.getByText('Print').closest('a').href).to.include('/print');
  });

  it('renders linkedin share button when isPlCourse is true', async () => {
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

    await waitFor(
      () => expect(screen.getByTitle('Share to LinkedIn')).to.exist
    );
    await waitFor(
      () => expect(screen.getByTitle('Share to Facebook')).to.exist
    );
    await waitFor(() => expect(screen.getByTitle('Share to Twitter')).to.exist);
    expect(screen.getByTitle('Share to LinkedIn').closest('a').href).to.equal(
      'https://www.linkedin.com/sharing/share-offsite/?linkedin'
    );
    expect(screen.getByTitle('Share to Facebook').closest('a').href).to.equal(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );
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
    expect(screen.getByText('Print').closest('a').href).to.include('/print');
  });
});
