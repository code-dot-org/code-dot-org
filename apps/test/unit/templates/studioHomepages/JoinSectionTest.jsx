import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedJoinSection as JoinSection} from '@cdo/apps/templates/studioHomepages/JoinSection';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import styles from '@cdo/apps/templates/studioHomepages/join-section.module.scss';

const DEFAULT_PROPS = {
  enrolledInASection: false,
  isTeacher: false,
  updateSections: () => {},
  updateSectionsResult: () => {},
};

describe('JoinSection', () => {
  let server;
  beforeEach(() => {
    server = sinon.createFakeServer();
  });

  afterEach(() => {
    server.restore();
  });

  it('renders with the dashed-border class when not enrolled in a section', () => {
    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} enrolledInASection={false} />
    );
    expect(wrapper.prop('className')).to.include(styles.mainDashed);
  });

  it('renders without the dashed-border class when enrolled in a section', () => {
    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} enrolledInASection={true} />
    );
    expect(wrapper.prop('className')).to.not.include(styles.mainDashed);
  });

  it('renders with disabled button when input is empty', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    expect(wrapper.find(MuiButton).prop('disabled')).to.be.true;
    wrapper.find(TextField).simulate('change', {target: {value: 'ABCDEF'}});
    expect(wrapper.find(MuiButton).prop('disabled')).to.be.false;
  });

  it('updates state when typing', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.find(TextField).simulate('change', {target: {value: 'ABCDEF'}});
    expect(wrapper.state()).to.deep.equal({sectionCode: 'ABCDEF'});
    expect(wrapper.find(TextField).prop('value')).to.equal('ABCDEF');
  });

  it('button click sends join request', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'success',
      }),
    ]);

    const updateSections = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find(TextField).prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} updateSections={updateSections} />
    );
    wrapper.find(TextField).simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find(MuiButton).simulate('click');
    server.respond();
  });

  it('trims and upper cases join code', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'success',
      }),
    ]);

    const updateSections = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find(TextField).prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} updateSections={updateSections} />
    );
    wrapper.find(TextField).simulate('change', {target: {value: ' aBcDeF  '}});
    wrapper.find(MuiButton).simulate('click');
    server.respond();
  });

  it('enter key sends join request', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'success',
      }),
    ]);

    const updateSections = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find(TextField).prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection {...DEFAULT_PROPS} updateSections={updateSections} />
    );
    wrapper.find(TextField).simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find(TextField).simulate('keyup', {key: 'Enter'});
    server.respond();
  });

  it('escape key clears input', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({sectionCode: 'ABCDEF'});

    wrapper.find(TextField).simulate('keyup', {key: 'Escape'});
    expect(wrapper.state()).to.deep.equal({sectionCode: ''});
    expect(wrapper.find(TextField).prop('value')).to.equal('');
  });

  it('ignores other keyup events gracefully', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    wrapper.setState({sectionCode: 'ABC'});

    wrapper.find(TextField).simulate('keyup', {key: 'Z'});
    expect(wrapper.state()).to.deep.equal({sectionCode: 'ABC'});
    expect(wrapper.find(TextField).prop('value')).to.equal('ABC');
  });

  it('handles failed request with specific reason', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      422,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        sections: [{code: 'ABCDEF'}],
        result: 'failed',
      }),
    ]);

    const updateSectionsResult = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find(TextField).prop('value')).to.equal('');

      expect(updateSectionsResult).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        updateSectionsResult={updateSectionsResult}
      />
    );
    wrapper.find(TextField).simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find(MuiButton).simulate('click');
    server.respond();
  });

  it('handles failed request with no reason', done => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join', [
      422,
      {'Content-Type': 'application/json'},
      '',
    ]);

    const updateSectionsResult = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find(TextField).prop('value')).to.equal('');

      expect(updateSectionsResult).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        updateSectionsResult={updateSectionsResult}
      />
    );
    wrapper.find(TextField).simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find(MuiButton).simulate('click');
    server.respond();
  });

  it('makes get request to server for captcha info in componentDidMount', () => {
    const wrapper = shallow(<JoinSection {...DEFAULT_PROPS} />);
    const instance = wrapper.instance();
    const fetchCaptchaSpy = sinon.spy(instance, 'fetchCaptchaInfo');
    instance.componentDidMount();
    expect(fetchCaptchaSpy).to.have.been.calledOnce;
  });
});
