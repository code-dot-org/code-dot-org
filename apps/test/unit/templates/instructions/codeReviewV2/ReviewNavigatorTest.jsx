import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReviewV2/ReviewNavigator';
import * as utils from '@cdo/apps/utils';
import javalabMsg from '@cdo/javalab/locale';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  viewPeerList: true,
  loadPeers: () => {},
  teacherAccountViewingAsParticipant: false,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ReviewNavigator {...props} />);
};

describe('ReviewNavigator', () => {
  it('renders a dropdown when viewPeerList is true', () => {
    const wrapper = setUp({viewPeerList: true});
    const dropdown = wrapper.find(DropdownButton);
    expect(dropdown).to.have.length(1);
    expect(dropdown.props().text).to.equal(
      javalabMsg.youHaveProjectsToReview()
    );
  });

  it('renders back to project button when viewPeerList is false', () => {
    const wrapper = setUp({viewPeerList: false});
    const dropdown = wrapper.find(Button);
    expect(dropdown).to.have.length(1);
    expect(dropdown.props().text).to.equal(javalabMsg.returnToMyProject());
  });

  describe('dropdown elements', () => {
    it('displays peers if peers load successfully', () => {
      const fakePeerList = [
        {ownerId: 1, ownerName: 'Jerry'},
        {
          ownerId: 2,
          ownerName: 'Elaine',
        },
      ];
      const loadPeersStub = sinon.stub();
      const wrapper = setUp({viewPeerList: true, loadPeers: loadPeersStub});

      const dropdown = wrapper.find(DropdownButton);
      dropdown.simulate('click');
      loadPeersStub.callArgWith(0, fakePeerList);

      wrapper.update();
      expect(wrapper.find('a')).to.have.length(2);
      expect(wrapper.contains('Jerry')).to.be.true;
      expect(wrapper.contains('Elaine')).to.be.true;
    });

    it('displays error if peers do not load', () => {
      const loadPeersStub = sinon.stub();
      const wrapper = setUp({
        viewPeerList: true,
        loadPeers: loadPeersStub,
      });

      const dropdown = wrapper.find(DropdownButton);
      dropdown.simulate('click');
      loadPeersStub.callArg(1);

      wrapper.update();
      expect(wrapper.contains(javalabMsg.errorLoadingClassmates())).to.be.true;
    });

    it('displays no reviews if no peers are loaded', () => {
      const fakePeerList = [];
      const loadPeersStub = sinon.stub();
      const wrapper = setUp({
        viewPeerList: true,
        loadPeers: loadPeersStub,
      });

      const dropdown = wrapper.find(DropdownButton);
      dropdown.simulate('click');
      loadPeersStub.callArgWith(0, fakePeerList);

      wrapper.update();
      expect(wrapper.contains(javalabMsg.noOtherReviews())).to.be.true;
    });
  });

  it('on selecting peer calls navigateToHref with expected arg', () => {
    const navigateToHrefSpy = sinon.spy(utils, 'navigateToHref');
    sinon.stub(utils, 'currentLocation').returns({
      origin: 'fakeOrigin',
      pathname: '/fakePath',
    });
    const fakePeerList = [{ownerId: 1, ownerName: 'Jerry'}];
    const loadPeersStub = sinon.stub();
    const wrapper = setUp({viewPeerList: true, loadPeers: loadPeersStub});

    const dropdown = wrapper.find(DropdownButton);
    dropdown.simulate('click');
    loadPeersStub.callArgWith(0, fakePeerList);

    wrapper.update();

    wrapper.find('a').simulate('click');
    expect(navigateToHrefSpy).to.have.been.calledWith(
      'fakeOrigin/fakePath?viewingCodeReview=true&user_id=1'
    );

    utils.currentLocation.restore();
    utils.navigateToHref.restore();
  });

  it('on returning to project navigates to expected url', () => {
    const navigateToHrefSpy = sinon.spy(utils, 'navigateToHref');
    sinon.stub(utils, 'currentLocation').returns({
      origin: 'fakeOrigin',
      pathname: '/fakePath',
    });
    const wrapper = setUp({viewPeerList: false});

    wrapper.find(Button).simulate('click');
    expect(navigateToHrefSpy).to.have.been.calledWith(
      'fakeOrigin/fakePath?viewingCodeReview=true'
    );

    utils.currentLocation.restore();
    utils.navigateToHref.restore();
  });
});
