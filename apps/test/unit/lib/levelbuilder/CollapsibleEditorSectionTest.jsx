import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';

describe('CollapsibleEditorSection', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      title: 'Section Title'
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(
      <CollapsibleEditorSection {...defaultProps}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );
    expect(wrapper.contains('Section Title')).to.be.true;
    expect(wrapper.contains('Child')).to.be.true;
    expect(wrapper.find('span').length).to.equal(1);
    expect(wrapper.find('FontAwesome').length).to.equal(1);
    expect(wrapper.state().collapsed).to.equal(false);

    const editorsWrapper = wrapper.children().last();
    expect(editorsWrapper.props().style.width).to.equal(970);
  });

  it('renders in full width', () => {
    const wrapper = shallow(
      <CollapsibleEditorSection {...defaultProps} fullWidth={true}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );
    const editorsWrapper = wrapper.children().last();
    expect(editorsWrapper.props().style.width).to.equal(null);
  });

  it('clicking h2 collapses area', () => {
    const wrapper = mount(
      <CollapsibleEditorSection {...defaultProps}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );

    let icon = wrapper.find('FontAwesome');
    expect(wrapper.state().collapsed).to.equal(false);
    expect(icon.props().icon).to.include('compress');

    wrapper.find('h2').simulate('click');

    expect(wrapper.state().collapsed).to.equal(true);
    expect(wrapper.find('FontAwesome').props().icon).to.include('expand');
  });
});
