import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewDataDocForm from '@cdo/apps/lib/levelbuilder/data-docs-editor/NewDataDocForm';

import {expect} from '../../../../util/reconfiguredChai';

describe('NewDataDocForm', () => {
  it('renders form', () => {
    const wrapper = shallow(<NewDataDocForm />);
    expect(wrapper.find('form')).to.exist;
  });
  ['Slug', 'Name'].forEach(word => {
    it(`contains field for ${word}`, () => {
      const wrapper = shallow(<NewDataDocForm />);
      expect(wrapper.text()).to.contain(word);
    });
  });
  it('contains field for Content', () => {
    const wrapper = shallow(<NewDataDocForm />);
    expect(
      wrapper.find('TextareaWithMarkdownPreview').first().props().label
    ).to.equal('Content');
  });
});
