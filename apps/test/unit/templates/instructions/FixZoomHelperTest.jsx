import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import FixZoomHelper from '@cdo/apps/templates/FixZoomHelper';

describe('FixZoomHelper', function() {
  it('shows nothing when not zoomed', function() {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isLandscape').returns(true);
    sinon.stub(instance, 'isZoomed').returns(false);
    instance.updateViewport();

    expect(instance.state.mode).to.equal('none');
  });

  it('shows button when zoomed', function() {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isLandscape').returns(true);
    sinon.stub(instance, 'isZoomed').returns(true);
    instance.updateViewport();

    expect(instance.state.mode).to.equal('button');
  });

  it('shows helper when zoomed and button pressed', function() {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isLandscape').returns(true);
    sinon.stub(instance, 'isZoomed').returns(true);
    instance.updateViewport();

    instance.onButtonClick();

    expect(instance.state.mode).to.equal('helper');
  });

  it('shows button again when zoomed and helper pressed', function() {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isLandscape').returns(true);
    sinon.stub(instance, 'isZoomed').returns(true);
    instance.updateViewport();

    instance.onButtonClick();

    expect(instance.state.mode).to.equal('helper');

    instance.onHelperClick();

    expect(instance.state.mode).to.equal('button');
  });

  it('shows nothing when zoomed and button pressed and zoomed back out', function() {
    const component = shallow(<FixZoomHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isLandscape').returns(true);
    const isZoomedStub = sinon.stub(instance, 'isZoomed');
    isZoomedStub.returns(true);
    instance.updateViewport();

    instance.onButtonClick();

    expect(instance.state.mode).to.equal('helper');

    isZoomedStub.returns(false);
    instance.updateViewport();

    expect(instance.state.mode).to.equal('none');
  });
});
