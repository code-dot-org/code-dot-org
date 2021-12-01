import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import {UnconnectedStudioAppWrapper as StudioAppWrapper} from '@cdo/apps/templates/StudioAppWrapper';
import FixZoomHelper from '@cdo/apps/templates/FixZoomHelper';
import HideToolbarHelper from '@cdo/apps/templates/HideToolbarHelper';
import RotateContainer from '@cdo/apps/templates/RotateContainer';
import StudioAppIdleTimer from '@cdo/apps/templates/StudioAppIdleTimer';

const DEFAULT_PROPS = {
  assetUrl: () => '/',
  isEmbedView: false,
  isShareView: false,
  children: <div />
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(
    <StudioAppWrapper {...props}>{props.children}</StudioAppWrapper>
  );
};

describe('StudioAppWrapper', () => {
  it('renders a FixZoomHelper', () => {
    const wrapper = setUp();
    expect(wrapper.find(FixZoomHelper)).to.have.length(1);
  });

  it('renders a HideToolbarHelper', () => {
    const wrapper = setUp();
    expect(wrapper.find(HideToolbarHelper)).to.have.length(1);
  });

  it('renders RotateContainer if not isEmbedView or isShareView', () => {
    const wrapper = setUp({isEmbedView: false, isShareView: false});
    expect(wrapper.find(RotateContainer)).to.have.length(1);
  });

  it('does not render RotateContainer if isEmbedView', () => {
    const wrapper = setUp({isEmbedView: true, isShareView: false});
    expect(wrapper.find(RotateContainer)).to.have.length(0);
  });

  it('does not render RotateContainer if isShareView', () => {
    const wrapper = setUp({isEmbedView: false, isShareView: true});
    expect(wrapper.find(RotateContainer)).to.have.length(0);
  });

  it('renders a StudioAppIdleTimer', () => {
    const wrapper = setUp({isEmbedView: false, isShareView: true});
    expect(wrapper.find(StudioAppIdleTimer)).to.have.length(1);
  });

  it('renders children', () => {
    const child = <div className="child">some child</div>;
    const wrapper = setUp({children: child});
    expect(wrapper.find('.child')).to.have.length(1);
  });
});
