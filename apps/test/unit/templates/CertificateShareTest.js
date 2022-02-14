import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import CertificateShare from '@cdo/apps/templates/CertificateShare';

const defaultProps = {
  imageUrl: '/certificate-image',
  printUrl: '/certificate-print',
  announcement: {
    image: '/announcement-image',
    title: 'Title Text',
    body: 'body text',
    buttonId: 'button-id',
    buttonUrl: '/button-url',
    buttonText: 'button text'
  }
};

describe('CertificateShare', () => {
  let storedWindowDashboard;

  beforeEach(() => {
    storedWindowDashboard = window.dashboard;
    window.dashboard = {
      CODE_ORG_URL: '//code.org'
    };
  });

  afterEach(() => {
    window.dashboard = storedWindowDashboard;
  });

  it('renders announcement image url relative to pegasus', () => {
    const props = {...defaultProps};
    const wrapper = shallow(
      <CertificateShare
        imageUrl={props.imageUrl}
        printUrl={props.printUrl}
        announcement={props.announcement}
      />
    );

    const printLink = wrapper.find('a');
    expect(printLink.prop('href')).to.equal('/certificate-print');
    const image = printLink.find('img');
    expect(image.prop('src')).to.equal('/certificate-image');

    const block = wrapper.find('Connect(UnconnectedTwoColumnActionBlock)');
    expect(block.prop('imageUrl')).to.equal('//code.org/announcement-image');
  });
});
