import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import RemoveCoteacherDialog from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/RemoveCoteacherDialog';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const createStubbedCoteacherDialog = coteacherToRemove => {
  const setCoteacherToRemove = sinon.spy();
  const removeSavedCoteacher = sinon.spy();
  const setCoteachersToAdd = sinon.spy();

  const wrapper = shallow(
    <RemoveCoteacherDialog
      coteacherToRemove={coteacherToRemove}
      setCoteacherToRemove={setCoteacherToRemove}
      removeSavedCoteacher={removeSavedCoteacher}
      setCoteachersToAdd={setCoteachersToAdd}
    />
  );

  return {
    wrapper: wrapper,
    setCoteacherToRemove: setCoteacherToRemove,
    removeSavedCoteacher: removeSavedCoteacher,
    setCoteachersToAdd: setCoteachersToAdd,
  };
};

describe('RemoveCoteacherDialog', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('does not show dialog when coteacher to remove not supplied', () => {
    const {wrapper} = createStubbedCoteacherDialog(null);

    expect(wrapper).to.be.empty;
  });

  it('show dialog when coteacher to remove supplied', () => {
    const {wrapper} = createStubbedCoteacherDialog({
      instructorEmail: 'newsaurus@code.org',
    });

    expect(wrapper.find('Button')).to.have.lengthOf(2);
    expect(wrapper.find('StrongText').dive().text()).to.contain(
      'Remove newsaurus@code.org'
    );
  });
  it('cancel remove does nothing', () => {
    const {
      wrapper,
      setCoteacherToRemove,
      removeSavedCoteacher,
      setCoteachersToAdd,
    } = createStubbedCoteacherDialog({instructorEmail: 'newsaurus@code.org'});

    expect(wrapper.find('AccessibleDialog').length).to.equal(1);

    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(setCoteacherToRemove).to.have.been.calledOnceWith(null);
    expect(removeSavedCoteacher).to.have.not.been.called;
    expect(setCoteachersToAdd).to.have.not.been.called;
    expect(fetchSpy).to.have.not.been.called;
  });
  it('Remove unsubmitted', () => {
    const {
      wrapper,
      setCoteacherToRemove,
      removeSavedCoteacher,
      setCoteachersToAdd,
    } = createStubbedCoteacherDialog({instructorEmail: 'newsaurus@code.org'});

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    expect(setCoteacherToRemove).to.have.been.calledOnceWith(null);
    expect(removeSavedCoteacher).to.have.not.been.called;
    expect(setCoteachersToAdd).to.have.been.calledOnce;
    expect(fetchSpy).to.have.not.been.called;
  });
  it('Remove submitted', done => {
    fetchSpy.returns(Promise.resolve({ok: true}));
    const setCoteachersToAdd = sinon.spy();
    const removeSavedCoteacherSpy = sinon.spy();

    const setCoteacherToRemove = sinon.spy(function (coteacherToRemove) {
      try {
        expect(removeSavedCoteacherSpy).to.have.been.calledOnceWith(1);
        expect(coteacherToRemove).to.equal(null);
        expect(setCoteachersToAdd).to.have.not.been.called;
        expect(fetchSpy).to.have.been.calledOnce;
      } catch (e) {
        done(e);
      }
      done();
    });

    const submittedCoteacher = {
      instructorEmail: 'oldsaurus@code.org',
      id: 1,
      status: 'invited',
    };

    const wrapper = shallow(
      <RemoveCoteacherDialog
        coteacherToRemove={submittedCoteacher}
        setCoteacherToRemove={setCoteacherToRemove}
        removeSavedCoteacher={removeSavedCoteacherSpy}
        setCoteachersToAdd={setCoteachersToAdd}
      />
    );

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});
  });
  it('Failed request closes dialog, but does not remove', done => {
    fetchSpy.returns(Promise.resolve({ok: false}));

    const setCoteachersToAdd = sinon.spy();
    const removeSavedCoteacherSpy = sinon.spy();

    const setCoteacherToRemove = sinon.spy(function (coteacherToRemove) {
      try {
        expect(removeSavedCoteacherSpy).not.to.have.been.called;
        expect(coteacherToRemove).to.equal(null);
        expect(setCoteachersToAdd).to.have.not.been.called;
        expect(fetchSpy).to.have.been.calledOnce;
      } catch (e) {
        done(e);
      }
      done();
    });

    const submittedCoteacher = {
      instructorEmail: 'oldsaurus@code.org',
      id: 1,
      status: 'invited',
    };

    const wrapper = shallow(
      <RemoveCoteacherDialog
        coteacherToRemove={submittedCoteacher}
        setCoteacherToRemove={setCoteacherToRemove}
        removeSavedCoteacher={removeSavedCoteacherSpy}
        setCoteachersToAdd={setCoteachersToAdd}
      />
    );

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});
  });
});
