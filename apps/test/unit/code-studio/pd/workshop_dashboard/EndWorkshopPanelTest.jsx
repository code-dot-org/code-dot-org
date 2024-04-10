import React from 'react';
import {mount} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import EndWorkshopPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/EndWorkshopPanel';

describe('EndWorkshopPanel', () => {
  let server, loadWorkshop;

  beforeEach(() => {
    server = sinon.createFakeServer();
    loadWorkshop = sinon.spy();
  });

  afterEach(() => {
    server.restore();
    server = null;
  });

  it('when ready to close', () => {
    mount(
      <EndWorkshopPanel
        workshopId={1}
        isReadyToClose={true}
        loadWorkshop={loadWorkshop}
      />
    );
  });

  it('when not ready to close', () => {
    mount(
      <EndWorkshopPanel
        workshopId={1}
        isReadyToClose={false}
        loadWorkshop={loadWorkshop}
      />
    );
  });

  it('end workshop, and then cancel', () => {
    const wrapper = mount(
      <EndWorkshopPanel
        workshopId={1}
        isReadyToClose={true}
        loadWorkshop={loadWorkshop}
      />
    );

    // Click the 'End workshop' button to display the confirmation dialog
    clickButton(wrapper, 'End Workshop');
    assertDialogIsShowing(wrapper);

    // Simulate clicking the 'Cancel' button to close the confirmation dialog
    wrapper.instance().handleEndWorkshopCancel();
    wrapper.update();
    refuteDialogIsShowing(wrapper);
  });

  it('end workshop, and then confirm', () => {
    const wrapper = mount(
      <EndWorkshopPanel
        workshopId={1}
        isReadyToClose={true}
        loadWorkshop={loadWorkshop}
      />
    );
    server.respondWith('POST', `/api/v1/pd/workshops/1/end`, [204, {}, '']);

    // Click the 'End workshop' button to display the confirmation dialog
    clickButton(wrapper, 'End Workshop');
    assertDialogIsShowing(wrapper);

    // Simulate clicking the 'Confirm' button to close the workshop
    wrapper.instance().handleEndWorkshopConfirmed();
    server.respond();
    wrapper.update();

    // Ensure we closed the dialog and reloaded the workshop
    refuteDialogIsShowing(wrapper);
    assert(loadWorkshop.calledOnce);
  });

  function assertDialogIsShowing(wrapper) {
    assert(
      wrapper.find('ConfirmationDialog').prop('show'),
      'ConfirmationDialog is showing'
    );
  }

  function refuteDialogIsShowing(wrapper) {
    assert(
      !wrapper.find('ConfirmationDialog').prop('show'),
      'ConfirmationDialog is not showing'
    );
  }

  function clickButton(wrapper, buttonText) {
    const button = wrapper
      .find('Button')
      .filterWhere(n => n.text().includes(buttonText));
    button.simulate('click');
  }
});
