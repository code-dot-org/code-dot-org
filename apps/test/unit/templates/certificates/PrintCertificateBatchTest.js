import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';

import {expect} from '../../../util/reconfiguredChai';

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
