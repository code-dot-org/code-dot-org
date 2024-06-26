import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewReferenceGuideForm from '@cdo/apps/lib/levelbuilder/reference-guide-editor/NewReferenceGuideForm';

import {expect} from '../../../../util/reconfiguredChai';

describe('NewReferenceGuide', () => {
  it('renders form', () => {
    const wrapper = shallow(<NewReferenceGuideForm baseUrl={'hello/world'} />);

    expect(wrapper.find('input').props().required).to.be.true;
    expect(wrapper.find('form').props().action).to.equal('hello/world');
  });
});
