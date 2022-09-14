import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';

describe('PrintCertificateBatch', () => {
  it('renders zero certificates', () => {
    const wrapper = shallow(<PrintCertificateBatch imageUrls={[]} />);
    expect(wrapper.find('img').length).to.equal(0);
  });

  it('renders one certificate', () => {
    const wrapper = shallow(<PrintCertificateBatch imageUrls={['/image1']} />);
    expect(wrapper.find('img').length).to.equal(1);
  });

  it('renders three certificates', () => {
    const wrapper = shallow(
      <PrintCertificateBatch imageUrls={['/image1', '/image2', '/image3']} />
    );
    expect(wrapper.find('img').length).to.equal(3);
  });
});
