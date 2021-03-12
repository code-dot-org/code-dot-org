import React from 'react';
import {expect} from '../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import HideToolbarHelper from '@cdo/apps/templates/HideToolbarHelper';

describe('HideToolbarHelper', function() {
  it('shows the hide toolbar helper', function() {
    const component = shallow(<HideToolbarHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isCompatibleiOS').returns(true);
    sinon.stub(instance, 'isHideCookieSet').returns(false);
    sinon.stub(instance, 'isLandscape').returns(true);
    sinon.stub(instance, 'isToolbarShowing').returns(true);

    instance.updateLayout();

    expect(instance.state.showHelper).to.be.true;
  });

  it('does not show the hide toolbar helper', function() {
    const component = shallow(<HideToolbarHelper />);

    const instance = component.instance();

    sinon.stub(instance, 'isCompatibleiOS').returns(true);
    sinon.stub(instance, 'isHideCookieSet').returns(false);
    sinon.stub(instance, 'isLandscape').returns(true);
    sinon.stub(instance, 'isToolbarShowing').returns(false);

    instance.updateLayout();

    expect(instance.state.showHelper).to.be.false;
  });

  it('we set a cookie when the toolbar goes away', function() {
    const component = shallow(<HideToolbarHelper />);

    const instance = component.instance();

    const setHideHelperCookie = sinon.stub(instance, 'setHideHelperCookie');

    sinon.stub(instance, 'isCompatibleiOS').returns(true);
    sinon.stub(instance, 'isHideCookieSet').returns(false);
    sinon.stub(instance, 'isLandscape').returns(true);
    const isToolbarShowing = sinon
      .stub(instance, 'isToolbarShowing')
      .returns(true);

    instance.updateLayout();

    expect(instance.state.showHelper).to.be.true;
    expect(setHideHelperCookie).not.to.have.been.called;

    isToolbarShowing.restore();
    sinon.stub(instance, 'isToolbarShowing').returns(false);

    instance.updateLayout();

    expect(instance.state.showHelper).to.be.false;
    expect(setHideHelperCookie).to.have.been.called;
  });
});
