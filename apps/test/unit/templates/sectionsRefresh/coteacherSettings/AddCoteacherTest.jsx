import $ from 'jquery';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';

import AddCoteacher from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/AddCoteacher';

describe('AddCoteacher', () => {
  it('shows input, button and count', () => {
    const wrapper = shallow(
      <AddCoteacher
        numCoteachers={3}
        coteachersToAdd={[]}
        setCoteachersToAdd={() => {}}
        addError={''}
        setAddError={() => {}}
      />
    );
    expect(wrapper.find('input').first()).to.exist;
    expect(wrapper.find('Button').first().props().disabled).to.be.false;
    expect(wrapper.find('Figcaption').dive().text()).to.equal(
      '3/5 co-teachers added'
    );
  });
  it('shows error', () => {
    const wrapper = shallow(
      <AddCoteacher
        numCoteachers={0}
        coteachersToAdd={[]}
        setCoteachersToAdd={() => {}}
        addError={'The T-rex ate everyone'}
        setAddError={() => {}}
      />
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
      <AddCoteacher
        numCoteachers={5}
        coteachersToAdd={[]}
        setCoteachersToAdd={() => {}}
        addError={''}
        setAddError={() => {}}
      />
    );
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });

  it('adds coteacher when valid email is added', () => {
    let coteachersToAdd = ['coelophysis@code.org'];
    const setCoteachersToAdd = func =>
      (coteachersToAdd = func(coteachersToAdd));

    sinon.stub($, 'ajax').returns({
      done: sinon
        .stub()
        .callsArg(0)
        .returns({fail: () => {}}),
    });

    const wrapper = shallow(
      <AddCoteacher
        numCoteachers={3}
        coteachersToAdd={coteachersToAdd}
        setCoteachersToAdd={setCoteachersToAdd}
        addError={''}
        setAddError={() => {}}
      />
    );
    wrapper
      .find('input')
      .simulate('change', {target: {value: 'new-email@code.org'}});
    wrapper
      .find('Button[id="add-coteacher"]')
      .simulate('click', {preventDefault: () => {}});

    expect(coteachersToAdd).to.deep.equal([
      'new-email@code.org',
      'coelophysis@code.org',
    ]);

    $.ajax.restore();
  });

  it('shows error when adding email that was added but not saved', () => {
    const setCoteachersToAddSpy = sinon.spy();
    const setAddErrorSpy = sinon.spy();

    const wrapper = shallow(
      <AddCoteacher
        numCoteachers={3}
        coteachersToAdd={['same@code.org']}
        setCoteachersToAdd={setCoteachersToAddSpy}
        addError={''}
        setAddError={setAddErrorSpy}
      />
    );
    wrapper
      .find('input')
      .simulate('change', {target: {value: 'same@code.org'}});
    wrapper
      .find('Button[id="add-coteacher"]')
      .simulate('click', {preventDefault: () => {}});

    expect(setAddErrorSpy).to.have.been.calledOnce.with(
      'same@code.org is already a co-teacher for this section.'
    );
    expect(setCoteachersToAddSpy).not.to.have.been.called;
  });

  it('trims email for validation', () => {});

  it('shows error if not an email', () => {});

  it('calls check method and if successful adds email', () => {});

  it('calls check method and shows returned error', () => {});
  it('clears error message on success', () => {});
});
