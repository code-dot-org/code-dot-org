import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import JoinSection from '@cdo/apps/templates/studioHomepages/JoinSection';

const DEFAULT_PROPS = {
  enrolledInASection: false,
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

  it('renders with a dashbed border when not enrolled in a section', () => {
    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        enrolledInASection={false}
      />
    );
    expect(wrapper.prop('style')).to.include({borderStyle: 'dashed'});
  });

  it('renders with a solid border when enrolled in a section', () => {
    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        enrolledInASection={true}
      />
    );
    expect(wrapper.prop('style')).to.include({borderStyle: 'solid'});
  });

  it('updates state when typing', () => {
    const wrapper = shallow(
      <JoinSection{...DEFAULT_PROPS}/>
    );
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    expect(wrapper.state()).to.deep.equal({sectionCode: 'ABCDEF'});
    expect(wrapper.find('input').prop('value')).to.equal('ABCDEF');
  });

  it('button click sends join request', (done) => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join',
      [
        200,
        { "Content-Type": "application/json" },
        JSON.stringify({
          sections: [
            {code: 'ABCDEF'}
          ],
          result: 'success'
        })
      ]
    );

    const updateSections = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find('input').prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        updateSections={updateSections}
      />
    );
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });

  it('enter key sends join request', (done) => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join',
      [
        200,
        { "Content-Type": "application/json" },
        JSON.stringify({
          sections: [
            {code: 'ABCDEF'}
          ],
          result: 'success'
        })
      ]
    );

    const updateSections = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
      expect(wrapper.find('input').prop('value')).to.equal('');

      expect(updateSections).to.have.been.calledOnce;

      done();
    });

    const wrapper = shallow(
      <JoinSection
        {...DEFAULT_PROPS}
        updateSections={updateSections}
      />
    );
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('input').simulate('keyup', {key: 'Enter'});
    server.respond();
  });

  it('escape key clears input', () => {
    const wrapper = shallow(
      <JoinSection{...DEFAULT_PROPS}/>
    );
    wrapper.setState({sectionCode: 'ABCDEF'});

    wrapper.find('input').simulate('keyup', {key: 'Escape'});
    expect(wrapper.state()).to.deep.equal({sectionCode: ''});
    expect(wrapper.find('input').prop('value')).to.equal('');
  });

  it('ignores other keyup events gracefully', () => {
    const wrapper = shallow(
      <JoinSection{...DEFAULT_PROPS}/>
    );
    wrapper.setState({sectionCode: 'ABC'});

    wrapper.find('input').simulate('keyup', {key: 'Z'});
    expect(wrapper.state()).to.deep.equal({sectionCode: 'ABC'});
    expect(wrapper.find('input').prop('value')).to.equal('ABC');
  });

  it('handles failed request with specific reason', (done) => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join',
      [
        422,
        { "Content-Type": "application/json" },
        JSON.stringify({
          sections: [
            {code: 'ABCDEF'}
          ],
          result: 'failed'
        })
      ]
    );

    const updateSectionsResult = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
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
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });

  it('handles failed request with no reason', (done) => {
    server.respondWith('POST', '/api/v1/sections/ABCDEF/join',
      [
        422,
        { "Content-Type": "application/json" },
        ''
      ]
    );

    const updateSectionsResult = sinon.spy(function () {
      expect(wrapper.state()).to.deep.equal({sectionCode: ''});
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
    wrapper.find('input').simulate('change', {target: {value: 'ABCDEF'}});
    wrapper.find('Button').simulate('click');
    server.respond();
  });
});
