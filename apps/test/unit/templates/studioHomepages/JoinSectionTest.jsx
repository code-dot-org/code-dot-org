import {expect} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import JoinSection from '@cdo/apps/templates/studioHomepages/JoinSection';

const DEFAULT_PROPS = {
  enrolledInASection: false,
  updateSections: () => {},
  updateSectionsResult: () => {}
};

describe('JoinSection', () => {
  let server;
  beforeEach(() => {
    server = sinon.createFakeServer();
  });

  afterEach(() => {
    server.restore();
  });

  it('renders spinner while asynchronoous request is finishing', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    expect(wrapper.find('Spinner')).to.have.lengthOf(1);
    expect(wrapper.prop('style')).to.include({marginTop: '10px'});
  });

  it('renders with a dashed border when not enrolled in a section', () => {
    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} enrolledInASection={false} />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    expect(wrapper.prop('style')).to.include({borderStyle: 'dashed'});
  });

  it('renders with a solid border when enrolled in a section', () => {
    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} enrolledInASection={true} />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    expect(wrapper.prop('style')).to.include({borderStyle: 'solid'});
  });

  it('renders with disabled button when input is empty', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({isLoaded: true, key: 'testKey'});
    expect(wrapper.find('Button').prop('disabled')).to.be.true;
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    expect(wrapper.find('Button').prop('disabled')).to.be.false;
  });

  it('updates state when typing', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    expect(wrapper.state('sectionCode')).to.equal('ABCDEF');
    expect(wrapper.find('input').prop('value')).to.equal('ABCDEF');
  });

  it('button click sends join request', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'success'
      })
    ]);

    const updateSections = sinon.spy(function() {
      expect(wrapper.state('sectionCode')).to.equal('');
      expect(wrapper.find('input').prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} updateSections={updateSections} />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });

  it('trims and upper cases join code', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'success'
      })
    ]);

    const updateSections = sinon.spy(function() {
      expect(wrapper.state('sectionCode')).to.equal('');
      expect(wrapper.find('input').prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} updateSections={updateSections} />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: ' aBcDeF  '}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });

  it('enter key sends join request', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'success'
      })
    ]);

    const updateSections = sinon.spy(function() {
      expect(wrapper.state('sectionCode')).to.equal('');
      expect(wrapper.find('input').prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} updateSections={updateSections} />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('input').simulate('keyup', {key: 'Enter'});
    server.respond();
  });

  it('escape key clears input', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.setState({sectionCode: 'ABCDEF'});
    wrapper.find('input').simulate('keyup', {key: 'Escape'});
    expect(wrapper.state('sectionCode')).to.equal('');
    expect(wrapper.find('input').prop('value')).to.equal('');
  });

  it('ignores other keyup events gracefully', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({sectionCode: 'ABC'});
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('keyup', {key: 'Z'});
    expect(wrapper.state('sectionCode')).to.equal('ABC');
    expect(wrapper.find('input').prop('value')).to.equal('ABC');
  });

  it('handles failed request with specific reason', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      422,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'failed'
      })
    ]);

    const updateSectionsResult = sinon.spy(function() {
      expect(wrapper.state('sectionCode')).to.equal('');
      expect(wrapper.find('input').prop('value')).to.equal('');

      expect(updateSectionsResult).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        updateSectionsResult={updateSectionsResult}
      />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });

  it('handles failed request with no reason', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      422,
      {'Content-Type': 'application/json'},
      ''
    ]);
    const updateSectionsResult = sinon.spy(function() {
      expect(wrapper.state('sectionCode')).to.equal('');
      expect(wrapper.find('input').prop('value')).to.equal('');
      expect(updateSectionsResult).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        updateSectionsResult={updateSectionsResult}
      />
    );
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });

  it('makes get request to server for captcha info in componentDidMount', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    const instance = wrapper.instance();
    const fetchCaptchaSpy = sinon.spy(instance, 'fetchCaptchaInfo');
    instance.componentDidMount();
    expect(fetchCaptchaSpy).to.have.been.calledOnce;
  });

  it('checks to see if captcha validation is necessary before joining section', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    const instance = wrapper.instance();
    const joinSectionSpy = sinon.spy(instance, 'joinSectionWithoutCaptcha');
    wrapper.setState({isLoaded: true, key: 'testKey'});
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('input').simulate('keyup', {key: 'Enter'});
    expect(joinSectionSpy).to.have.been.calledOnce;
  });

  it('only renders captcha dialog after asynchronous request is finished', () => {
    let wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    expect(wrapper.state('isLoaded')).to.equal(false);
    expect(wrapper.find('ReCaptchaDialog')).to.have.lengthOf(0);
    wrapper.setState({isLoaded: true, key: 'testKey'});
    expect(wrapper.find('ReCaptchaDialog')).to.have.lengthOf(1);
  });

  it('only opens recaptcha dialog if display captcha is true', () => {
    let wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({isLoaded: true, key: 'testKey'});
    expect(
      wrapper
        .find('ReCaptchaDialog')
        .at(0)
        .props().isOpen
    ).to.equal(false);
    wrapper.setState({displayCaptcha: true});
    expect(
      wrapper
        .find('ReCaptchaDialog')
        .at(0)
        .props().isOpen
    ).to.equal(true);
  });

  it('increments section attempts on section join attempt', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({isLoaded: true, key: 'testKey'});
    expect(wrapper.state('sectionAttempts')).to.equal(0);
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    expect(wrapper.state('sectionAttempts')).to.equal(1);
  });
});
