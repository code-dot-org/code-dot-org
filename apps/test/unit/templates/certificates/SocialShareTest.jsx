import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import * as urlTests from '@cdo/apps/code-studio/url_test';
import SocialShare from '@cdo/apps/templates/certificates/SocialShare';

describe('SocialShare', () => {
  let testImageAccessStub;

  beforeEach(() => {
    testImageAccessStub = sinon.stub(urlTests, 'default');
  });

  afterEach(() => {
    testImageAccessStub.restore();
  });

  it('renders facebook and twitter share buttons when isPlCourse is false', async () => {
    testImageAccessStub.resolvesArg(1);
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

    await waitFor(() => expect(screen.getAllByRole('link').length).to.equal(3));
    const shareLinks = screen.getAllByRole('link');
    expect(shareLinks[0].href).to.equal(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );
    expect(shareLinks[1].href).to.equal('https://twitter.com/share?twitter');
    expect(shareLinks[2].href).to.include('/print');
  });

  it('renders linkedin share button when isPlCourse is true', async () => {
    testImageAccessStub.resolvesArg(1);
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

    await waitFor(() => expect(screen.getAllByRole('link').length).to.equal(4));
    const shareLinks = screen.getAllByRole('link');
    expect(shareLinks[0].href).to.equal(
      'https://www.linkedin.com/sharing/share-offsite/?linkedin'
    );
    expect(shareLinks[1].href).to.equal(
      'https://www.facebook.com/sharer/sharer.php?facebook'
    );
    expect(shareLinks[2].href).to.equal('https://twitter.com/share?twitter');
    expect(shareLinks[3].href).to.include('/print');
  });

  it('does not render social share buttons when under13 is true', async () => {
    testImageAccessStub.resolvesArg(1);
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

    await waitFor(() => expect(screen.getAllByRole('link').length).to.equal(1));
    const shareLinks = screen.getAllByRole('link');
    expect(shareLinks[0].href).to.include('/print');
  });
});
