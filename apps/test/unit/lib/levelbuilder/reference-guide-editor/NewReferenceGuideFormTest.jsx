import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import NewReferenceGuideForm from '@cdo/apps/lib/levelbuilder/reference-guide-editor/NewReferenceGuideForm';

describe('NewReferenceGuide', () => {
  it('renders form', () => {
    const wrapper = shallow(<NewReferenceGuideForm baseUrl={'hello/world'} />);

    expect(wrapper.find('input').props().required).to.be.true;
    expect(wrapper.find('form').props().action).to.equal('hello/world');
  });
});
