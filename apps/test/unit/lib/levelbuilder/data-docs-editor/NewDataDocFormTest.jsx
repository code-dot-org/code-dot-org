import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewDataDocForm from '@cdo/apps/lib/levelbuilder/data-docs-editor/NewDataDocForm';

describe('NewDataDocForm', () => {
  it('renders form', () => {
    const wrapper = shallow(<NewDataDocForm />);
    expect(wrapper.find('form')).toBeDefined();
  });
  ['Slug', 'Name'].forEach(word => {
    it(`contains field for ${word}`, () => {
      const wrapper = shallow(<NewDataDocForm />);
      expect(wrapper.text()).toContain(word);
    });
  });
  it('contains field for Content', () => {
    const wrapper = shallow(<NewDataDocForm />);
    expect(
      wrapper.find('TextareaWithMarkdownPreview').first().props().label
    ).toBe('Content');
  });
});
