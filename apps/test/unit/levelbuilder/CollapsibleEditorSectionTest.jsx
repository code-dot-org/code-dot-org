import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CollapsibleEditorSection from '@cdo/apps/levelbuilder/CollapsibleEditorSection';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import moduleStyles from '@cdo/apps/levelbuilder/levelbuilder.module.scss';

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
    expect(wrapper.contains('Section Title')).to.be.true;
    expect(wrapper.contains('Child')).to.be.true;
    expect(wrapper.find('span').length).to.equal(1);
    let icon = wrapper.find('FontAwesome');
    expect(icon.length).to.equal(1);
    expect(icon.props().icon).to.include('compress');

    const editorsWrapper = wrapper.children().last();
    expect(editorsWrapper.props().className).to.include(
      moduleStyles.nonFullWidth
    );
  });

  it('renders in full width', () => {
    const wrapper = shallow(
      <CollapsibleEditorSection {...defaultProps} fullWidth={true}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );
    const editorsWrapper = wrapper.children().last();
    expect(editorsWrapper.props().className).to.not.include(
      moduleStyles.nonFullWidth
    );
  });

  it('clicking h2 collapses area', () => {
    const wrapper = mount(
      <CollapsibleEditorSection {...defaultProps}>
        <span>Child</span>
      </CollapsibleEditorSection>
    );

    let icon = wrapper.find('FontAwesome');
    expect(icon.props().icon).to.include('compress');

    wrapper.find('button').simulate('click');

    expect(wrapper.find('FontAwesome').props().icon).to.include('expand');
  });
});
