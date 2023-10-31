import $ from 'jquery';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import React from 'react';
import RemoveCoteacherDialog from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/RemoveCoteacherDialog';

const createStubbedCoteacherDialog = coteacherToRemove => {
  const setCoteacherToRemove = sinon.spy();
  const removeSavedCoteacher = sinon.spy();
  const setCoteachersToAdd = sinon.spy();

  const ajaxStub = sinon.stub($, 'ajax').returns({
    done: successCallback => {
      successCallback();
      return {fail: () => {}};
    },
  });

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
    ajaxStub: ajaxStub,
    setCoteacherToRemove: setCoteacherToRemove,
    removeSavedCoteacher: removeSavedCoteacher,
    setCoteachersToAdd: setCoteachersToAdd,
  };
};

describe('RemoveCoteacherDialog', () => {
  it('does not show dialog when coteacher to remove not supplied', () => {
    const wrapper = shallow(
      <RemoveCoteacherDialog
        coteacherToRemove={null}
        setCoteacherToRemove={() => {}}
        removeSavedCoteacher={() => {}}
        setCoteachersToAdd={() => {}}
      />
    );

    expect(wrapper).to.be.empty;
  });

  it('show dialog when coteacher to remove supplied', () => {
    const wrapper = shallow(
      <RemoveCoteacherDialog
        coteacherToRemove={{instructorEmail: 'newsaurus@code.org'}}
        setCoteacherToRemove={() => {}}
        removeSavedCoteacher={() => {}}
        setCoteachersToAdd={() => {}}
      />
    );

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
      ajaxStub,
    } = createStubbedCoteacherDialog({instructorEmail: 'newsaurus@code.org'});

    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(setCoteacherToRemove).to.have.been.calledOnceWith(null);
    expect(removeSavedCoteacher).to.have.not.been.called;
    expect(setCoteachersToAdd).to.have.not.been.called;
    expect(ajaxStub).to.have.not.been.called;
    expect(wrapper.find('AccessibleDialog')).to.be.empty;

    $.ajax.restore();
  });
  it('Remove unsubmitted', () => {
    const {
      wrapper,
      setCoteacherToRemove,
      removeSavedCoteacher,
      setCoteachersToAdd,
      ajaxStub,
    } = createStubbedCoteacherDialog({instructorEmail: 'newsaurus@code.org'});

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(setCoteacherToRemove).to.have.been.calledOnceWith(null);
    expect(removeSavedCoteacher).to.have.not.been.called;
    expect(setCoteachersToAdd).to.have.been.calledOnce;
    expect(ajaxStub).to.have.not.been.called;
    expect(wrapper.find('AccessibleDialog')).to.be.empty;

    $.ajax.restore();
  });
  it('Remove submitted', () => {
    const submittedCoteacher = {
      instructorEmail: 'oldsaurus@code.org',
      id: 1,
      status: 'invited',
    };

    const {
      wrapper,
      setCoteacherToRemove,
      removeSavedCoteacher,
      setCoteachersToAdd,
      ajaxStub,
    } = createStubbedCoteacherDialog(submittedCoteacher);

    wrapper
      .find('Button')
      .at(1)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(wrapper.find('AccessibleDialog')).to.be.empty;

    expect(setCoteacherToRemove).to.have.been.calledOnceWith(null);
    expect(removeSavedCoteacher).to.have.been.calledOnceWith(1);
    expect(setCoteachersToAdd).to.have.not.been.called;
    expect(ajaxStub).to.have.been.calledOnce;
    $.ajax.restore();
  });
});
