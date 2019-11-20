import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import DetailsPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/DetailsPanel';
import {States} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * Create a factory for the workshop object passed around by workshop dashboard components,
 * as retrieved from /api/v1/pd/workshops/<workshop-id>
 */
Factory.define('workshop')
  .sequence('id')
  .attr('state', States[0]);

describe('DetailsPanel', () => {
  function shallowDetailsPanel(props = {}) {
    return shallow(
      <DetailsPanel
        workshop={props.workshop || Factory.build('workshop')}
        onWorkshopSaved={sinon.spy()}
        {...props}
      />,
      {context: {router: {push: sinon.spy()}}}
    );
  }

  it('shows a readonly WorkshopForm by default', () => {
    const wrapper = shallowDetailsPanel();
    const workshopForm = wrapper.find('Connect(WorkshopForm)');
    assert.isOk(workshopForm, 'WorkshopForm was rendered');
    assert.isTrue(workshopForm.prop('readOnly'), 'WorkshopForm is readonly');
  });

  it('shows an edit button when the workshop is in "Not Started" state', () => {
    const wrapper = shallowDetailsPanel({
      workshop: Factory.build('workshop', {state: 'Not Started'})
    });
    const editButton = wrapper
      .find('Connect(WorkshopForm)')
      .find('Button')
      .filterWhere(n => 'Edit' === n.text());
    assert.isOk(editButton, 'Edit button was rendered');
  });

  it('does not show an edit button when the workshop is not in "Not Started" state', () => {
    States.filter(s => 'Not Started' !== s).forEach(state => {
      const wrapper = shallowDetailsPanel({
        workshop: Factory.build('workshop', {state})
      });
      const editButton = wrapper
        .find('Connect(WorkshopForm)')
        .find('Button')
        .filterWhere(n => 'Edit' === n.text());
      assert.isFalse(editButton.exists(), 'Edit button was not rendered');
    });
  });

  it('shows an editable WorkshopForm in edit mode', () => {
    const wrapper = shallowDetailsPanel({
      view: 'edit'
    });
    const workshopForm = wrapper.find('Connect(WorkshopForm)');
    assert.isOk(workshopForm, 'WorkshopForm was rendered');
    assert.isFalse(!!workshopForm.prop('readOnly'), 'WorkshopForm is editable');
  });

  it('edit mode includes a save button in the header', () => {
    const wrapper = shallowDetailsPanel({
      view: 'edit'
    });
    // Also shallow-render the panel header so we can check for controls
    const headerWrapper = shallow(wrapper.prop('header'));
    const headerSaveButton = headerWrapper
      .find('HeaderButton')
      .filterWhere(n => n.prop('text').includes('Save'));
    assert.isTrue(headerSaveButton.exists(), 'Save button is present');
  });

  it('Admin has an edit button in all workshop states', () => {
    States.forEach(state => {
      const wrapper = shallowDetailsPanel({
        workshop: Factory.build('workshop', {state}),
        isWorkshopAdmin: true
      });
      // Also shallow-render the panel header so we can check for controls
      const headerWrapper = shallow(wrapper.prop('header'));
      const headerEditButton = headerWrapper
        .find('HeaderButton')
        .filterWhere(n => n.prop('text').includes('Edit'));
      assert.isTrue(headerEditButton.exists(), 'Edit button is present');
    });
  });
});
