import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';

import AddCoteacher from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/AddCoteacher';

const DEFAULT_PROPS = {
  numCoteachers: 3,
  coteachersToAdd: [],
  setCoteachersToAdd: () => {},
  addError: '',
  setAddError: () => {},
};

const makeSpyWithAssertions = (assertions, done) =>
  sinon.spy(function (params) {
    try {
      assertions(params);
    } catch (e) {
      done(e);
    }
    done();
  });

const addTeacher = (wrapper, email) => {
  wrapper.find('input').simulate('change', {target: {value: email}});
  wrapper
    .find('Button[id="add-coteacher"]')
    .simulate('click', {preventDefault: () => {}});
};

describe('AddCoteacher', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });
  it('shows input, button and count', () => {
    const wrapper = shallow(<AddCoteacher {...DEFAULT_PROPS} />);

    expect(wrapper.find('input').first()).to.exist;
    expect(wrapper.find('Button').first().props().disabled).to.be.false;
    expect(wrapper.find('Figcaption').dive().text()).to.equal(
      '3/5 co-teachers added'
    );
  });
  it('shows error', () => {
    const wrapper = shallow(
      <AddCoteacher {...DEFAULT_PROPS} addError={'The T-rex ate everyone'} />
    );
    expect(wrapper.find('input').first()).to.exist;
    expect(wrapper.find('Button').first().props().disabled).to.be.false;
    expect(wrapper.find('Figcaption').dive().text()).to.include(
      'The T-rex ate everyone'
    );
    expect(wrapper.find('FontAwesome').props().icon).to.include('info-circle');
  });
  it('disables add button when max coteachers reached', () => {
    const wrapper = shallow(
      <AddCoteacher {...DEFAULT_PROPS} numCoteachers={5} />
    );
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });

  it('adds coteacher when valid email is added', done => {
    fetchSpy.returns(Promise.resolve({ok: true}));
    const setAddErrorSpy = sinon.spy();

    const setCoteachersToAddSpy = makeSpyWithAssertions(func => {
      expect(fetchSpy).to.be.calledOnce;
      expect(setCoteachersToAddSpy).to.be.calledOnce;
      expect(func([])).to.deep.equal(['new-email@code.org']);
      expect(setAddErrorSpy).to.have.been.calledOnceWith('');
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        coteachersToAdd={['coelophysis@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
      />
    );
    addTeacher(wrapper, 'new-email@code.org');
  });

  it('trims email for validation', done => {
    fetchSpy.returns(Promise.resolve({ok: true}));
    const setAddErrorSpy = sinon.spy();

    const setCoteachersToAddSpy = makeSpyWithAssertions(func => {
      expect(func([])).to.deep.equal(['new-email@code.org']);
      expect(setAddErrorSpy).to.have.been.calledOnceWith('');
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        coteachersToAdd={['coelophysis@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
      />
    );
    addTeacher(wrapper, '      new-email@code.org       ');
  });

  it('shows error when adding email that was added but not saved', done => {
    const setCoteachersToAddSpy = sinon.spy();

    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(error).to.equal(
        'same@code.org is already a co-teacher for this section.'
      );
      expect(setCoteachersToAddSpy).not.to.have.been.called;
      expect(fetchSpy).not.to.have.been.called;
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        coteachersToAdd={['same@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
      />
    );
    addTeacher(wrapper, 'same@code.org');
  });

  it('shows error if not an email', done => {
    const setCoteachersToAddSpy = sinon.spy();

    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(error).to.equal('not-an-eamil is not a valid email address.');
      expect(setCoteachersToAddSpy).not.to.have.been.called;
      expect(fetchSpy).not.to.have.been.called;
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
      />
    );
    addTeacher(wrapper, 'not-an-eamil');
  });

  it('calls check method and shows returned error', done => {
    fetchSpy.returns(Promise.resolve({ok: false, errorThrown: 'Not Found'}));
    const setCoteachersToAddSpy = sinon.spy();

    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(error).to.equal(
        'invalid-email@code.org is not associated with a Code.org teacher account.'
      );
      expect(setCoteachersToAddSpy).not.to.have.been.called;
      expect(fetchSpy).to.have.been.calledOnce;
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        coteachersToAdd={['coelophysis@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
      />
    );
    addTeacher(wrapper, 'invalid-email@code.org');
  });
});
