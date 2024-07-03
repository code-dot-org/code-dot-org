import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import RemoveCoteacherDialog from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/RemoveCoteacherDialog';



const createStubbedCoteacherDialog = coteacherToRemove => {
  const setCoteacherToRemove = jest.fn();
  const removeSavedCoteacher = jest.fn();
  const setCoteachersToAdd = jest.fn();

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
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('does not show dialog when coteacher to remove not supplied', () => {
    const {wrapper} = createStubbedCoteacherDialog(null);

    expect(Object.keys(wrapper)).toHaveLength(0);
  });

  it('show dialog when coteacher to remove supplied', () => {
    const {wrapper} = createStubbedCoteacherDialog({
      instructorEmail: 'newsaurus@code.org',
    });

    expect(wrapper.find('Button')).toHaveLength(2);
    expect(wrapper.find('StrongText').dive().text()).toContain('Remove newsaurus@code.org');
  });
  it('cancel remove does nothing', () => {
    const {
      wrapper,
      setCoteacherToRemove,
      removeSavedCoteacher,
      setCoteachersToAdd,
    } = createStubbedCoteacherDialog({instructorEmail: 'newsaurus@code.org'});

    expect(wrapper.find('AccessibleDialog').length).toBe(1);

    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});

    wrapper.update();

    expect(setCoteacherToRemove).to.have.been.calledOnceWith(null);
    expect(removeSavedCoteacher).not.toHaveBeenCalled();
    expect(setCoteachersToAdd).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
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
    expect(removeSavedCoteacher).not.toHaveBeenCalled();
    expect(setCoteachersToAdd).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('Remove submitted', done => {
    fetchSpy.mockReturnValue(Promise.resolve({ok: true}));
    const setCoteachersToAdd = jest.fn();
    const removeSavedCoteacherSpy = jest.fn();

    const setCoteacherToRemove = jest.fn(function (coteacherToRemove) {
      try {
        expect(removeSavedCoteacherSpy).to.have.been.calledOnceWith(1);
        expect(coteacherToRemove).toBeNull();
        expect(setCoteachersToAdd).not.toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalledTimes(1);
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
    fetchSpy.mockReturnValue(Promise.resolve({ok: false}));

    const setCoteachersToAdd = jest.fn();
    const removeSavedCoteacherSpy = jest.fn();

    const setCoteacherToRemove = jest.fn(function (coteacherToRemove) {
      try {
        expect(removeSavedCoteacherSpy).not.toHaveBeenCalled();
        expect(coteacherToRemove).toBeNull();
        expect(setCoteachersToAdd).not.toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalledTimes(1);
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
