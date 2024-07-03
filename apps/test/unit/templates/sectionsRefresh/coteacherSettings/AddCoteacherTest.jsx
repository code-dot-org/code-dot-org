import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import AddCoteacher from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/AddCoteacher';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  numCoteachers: 3,
  coteachersToAdd: [],
  setCoteachersToAdd: () => {},
  addError: '',
  setAddError: () => {},
  addSavedCoteacher: () => {},
};

const makeSpyWithAssertions = (assertions, done) =>
  sinon.spy(function (params) {
    // this is necessary to get an actual error message.
    // Otherwise it gets swallowed by the spy after the test is done.
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

  it('disables email input and add button when disabled', () => {
    const wrapper = shallow(<AddCoteacher {...DEFAULT_PROPS} disabled />);

    expect(wrapper.find('input').first().props().disabled).to.be.true;
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
    expect(wrapper.find('Figcaption')).to.have.lengthOf(0);
  });

  it('adds coteacher when valid email is added', done => {
    fetchSpy.returns(Promise.resolve({ok: true}));
    const setCoteachersToAddSpy = sinon.spy();
    const addSavedCoteacherSpy = sinon.spy();

    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(fetchSpy).to.be.calledOnceWith(
        `/api/v1/section_instructors/check?email=new-email%40code.org`
      );

      expect(setCoteachersToAddSpy).to.be.calledOnce;
      const spyCall = setCoteachersToAddSpy.getCall(0);
      expect(spyCall.args[0]([])).to.deep.equal(['new-email@code.org']);
      expect(error).to.equal('');
      expect(addSavedCoteacherSpy).to.not.have.been.called;
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        coteachersToAdd={['coelophysis@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
        addSavedCoteacher={addSavedCoteacherSpy}
      />
    );
    addTeacher(wrapper, 'new-email@code.org');
  });

  it('calls add api when email is added and editing section', done => {
    fetchSpy.returns(
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            status: 'invited',
            instructor_email: 'new-email@code.org',
          }),
      })
    );
    const setCoteachersToAddSpy = sinon.spy();
    const addSavedCoteacherSpy = sinon.spy();

    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(fetchSpy).to.be.calledOnce;
      const fetchCall = fetchSpy.getCall(0);
      expect(fetchCall.args[0]).to.equal(`/api/v1/section_instructors`);
      const fetchCallBody = JSON.parse(fetchCall.args[1].body);
      expect(fetchCallBody.section_id).to.equal(1);
      expect(fetchCallBody.email).to.equal('new-email@code.org');

      expect(setCoteachersToAddSpy).to.not.be.called;
      expect(error).to.equal('');
      expect(setAddErrorSpy).to.have.been.calledOnceWith('');
      expect(addSavedCoteacherSpy).to.have.been.calledOnceWith({
        id: 1,
        status: 'invited',
        instructorEmail: 'new-email@code.org',
        instructorName: undefined,
      });
    }, done);

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        sectionId={1}
        coteachersToAdd={['coelophysis@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
        addSavedCoteacher={addSavedCoteacherSpy}
      />
    );
    addTeacher(wrapper, 'new-email@code.org');
  });

  it('shows error if add call fails', done => {
    fetchSpy.returns(
      Promise.resolve({ok: false, statusText: 'Not Found', status: 404})
    );

    const addSavedCoteacherSpy = sinon.spy();

    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(error).to.equal(
        'invalid-email@code.org is not associated with a Code.org teacher account.'
      );
      expect(setCoteachersToAddSpy).not.to.have.been.called;

      expect(fetchSpy).to.be.calledOnce;

      expect(addSavedCoteacherSpy).to.not.have.been.called;
    }, done);

    const setCoteachersToAddSpy = sinon.spy();

    const wrapper = shallow(
      <AddCoteacher
        {...DEFAULT_PROPS}
        sectionId={1}
        coteachersToAdd={['coelophysis@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        setAddError={setAddErrorSpy}
        addSavedCoteacher={addSavedCoteacherSpy}
      />
    );
    addTeacher(wrapper, 'invalid-email@code.org');
  });

  it('trims email for validation', done => {
    fetchSpy.returns(Promise.resolve({ok: true}));
    const setCoteachersToAddSpy = sinon.spy();
    const setAddErrorSpy = makeSpyWithAssertions(error => {
      expect(setCoteachersToAddSpy).to.be.calledOnce;
      const spyCall = setCoteachersToAddSpy.getCall(0);
      expect(spyCall.args[0]([])).to.deep.equal(['new-email@code.org']);
      expect(error).to.equal('');
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
      expect(error).to.equal('Oops! You already invited same@code.org.');
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
    fetchSpy.returns(
      Promise.resolve({ok: false, statusText: 'Not Found', status: 404})
    );
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
