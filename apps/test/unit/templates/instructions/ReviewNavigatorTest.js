import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import ReviewNavigator from '@cdo/apps/templates/instructions/codeReview/ReviewNavigator';
import DropdownButton from '@cdo/apps/templates/DropdownButton';

describe('Review Navigator', () => {
  it('renders a dropdown if viewing the peer list', () => {
    let wrapper = shallow(<ReviewNavigator viewPeerList />);
    expect(wrapper.find(DropdownButton).length).to.equal(1);
  });

  it('renders a button by default', () => {
    let wrapper = shallow(<ReviewNavigator />);
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('renders an error if there is a load error', () => {
    let wrapper = shallow(<ReviewNavigator viewPeerList />);
    wrapper.instance().setState({loadError: true});
    let link = wrapper.find('a');
    expect(link.length).to.equal(1);
    expect(link.key()).to.equal('error');
  });

  it('renders an error when peers is undefined', () => {
    let wrapper = shallow(<ReviewNavigator viewPeerList />);

    wrapper.instance().setState({peers: undefined});
    let link = wrapper.find('a');
    expect(link.length).to.equal(1);
    expect(link.key()).to.equal('error');
  });

  it('renders a default message when peers is empty', () => {
    let wrapper = shallow(<ReviewNavigator viewPeerList />);

    wrapper.instance().setState({peers: []});
    let link = wrapper.find('a');
    expect(link.length).to.equal(1);
    expect(link.key()).to.equal('no-reviews');
  });

  it('renders peer list when peers exist', () => {
    const firstStudent = 'student1';
    const secondStudent = 'student2';
    const peerList = [
      {
        name: firstStudent,
        id: 1
      },
      {
        name: secondStudent,
        id: 2
      }
    ];
    let wrapper = shallow(<ReviewNavigator viewPeerList />);
    wrapper.instance().setState({peers: peerList});

    let link = wrapper.find('a');
    expect(link.length).to.equal(2);
    expect(link.first().key()).to.equal('1');
    expect(link.first().text()).to.equal(firstStudent);
    expect(link.last().key()).to.equal('2');
    expect(link.last().text()).to.equal(secondStudent);
  });

  it('renders a spinner when loading peers', () => {
    let wrapper = shallow(<ReviewNavigator viewPeerList />);

    wrapper.instance().setState({loadInProgress: true});
    let link = wrapper.find('a');
    expect(link.length).to.equal(1);
    expect(link.key()).to.equal('loading');
  });
});
