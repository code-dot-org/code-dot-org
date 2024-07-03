import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';



import moduleStyles from '@cdo/apps/lib/levelbuilder/levelbuilder.module.scss';

describe('CollapsibleEditorSection', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      title: 'Section Title',
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(
      <CollapsibleEditorSection {...defaultProps}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );
    expect(wrapper.contains('Section Title')).toBe(true);
    expect(wrapper.contains('Child')).toBe(true);
    expect(wrapper.find('span').length).toBe(1);
    let icon = wrapper.find('FontAwesome');
    expect(icon.length).toBe(1);
    expect(icon.props().icon).toContain('compress');

    const editorsWrapper = wrapper.children().last();
    expect(editorsWrapper.props().className).toEqual(expect.arrayContaining([moduleStyles.nonFullWidth]));
  });

  it('renders in full width', () => {
    const wrapper = shallow(
      <CollapsibleEditorSection {...defaultProps} fullWidth={true}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );
    const editorsWrapper = wrapper.children().last();
    expect(editorsWrapper.props().className).toEqual(expect.not.arrayContaining([moduleStyles.nonFullWidth]));
  });

  it('clicking h2 collapses area', () => {
    const wrapper = mount(
      <CollapsibleEditorSection {...defaultProps}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );

    let icon = wrapper.find('FontAwesome');
    expect(icon.props().icon).toContain('compress');

    wrapper.find('button').simulate('click');

    expect(wrapper.find('FontAwesome').props().icon).toContain('expand');
  });
});
