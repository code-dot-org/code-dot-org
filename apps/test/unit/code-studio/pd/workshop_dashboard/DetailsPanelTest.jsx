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
  it('shows a readonly WorkshopForm by default', () => {
    const wrapper = shallow(
      <DetailsPanel
        workshop={Factory.build('workshop')}
        onWorkshopSaved={sinon.spy()}
      />,
      {context: {router: {push: sinon.spy()}}}
    );

    const workshopForm = wrapper.find('Connect(WorkshopForm)');
    assert.isOk(workshopForm, 'WorkshopForm was rendered');
    assert.isTrue(workshopForm.prop('readOnly'), 'WorkshopForm is readonly');
  });

  it('shows an edit button when the workshop is in "Not Started" state', () => {
    const wrapper = shallow(
      <DetailsPanel
        workshop={Factory.build('workshop', {state: 'Not Started'})}
        onWorkshopSaved={sinon.spy()}
      />,
      {context: {router: {push: sinon.spy()}}}
    );
    const editButton = wrapper
      .find('Connect(WorkshopForm)')
      .find('Button')
      .filterWhere(n => 'Edit' === n.text());
    assert.isOk(editButton, 'Edit button was rendered');
  });

  it('does not show an edit button when the workshop is not in "Not Started" state', () => {
    States.filter(s => 'Not Started' !== s).forEach(state => {
      const wrapper = shallow(
        <DetailsPanel
          workshop={Factory.build('workshop', {state})}
          onWorkshopSaved={sinon.spy()}
        />,
        {context: {router: {push: sinon.spy()}}}
      );
      const editButton = wrapper
        .find('Connect(WorkshopForm)')
        .find('Button')
        .filterWhere(n => 'Edit' === n.text());
      assert.isFalse(editButton.exists(), 'Edit button was not rendered');
    });
  });

  it('renders an edit view', () => {
    const wrapper = shallow(
      <DetailsPanel view="edit" workshop={{}} onWorkshopSaved={sinon.spy()} />,
      {context: {router: {push: sinon.spy()}}}
    );
    assert.equal(
      `<WorkshopPanel header={{...}}>
  <div>
    <Connect(WorkshopForm) workshop={{...}} onSaved={[Function: proxy]} />
  </div>
</WorkshopPanel>`,
      wrapper.debug(),
      wrapper.debug()
    );
  });

  it('Admin can edit in other workshop states', () => {
    const wrapper = shallow(
      <DetailsPanel
        workshop={{state: 'In Progress'}}
        isWorkshopAdmin
        onWorkshopSaved={sinon.spy()}
      />,
      {context: {router: {push: sinon.spy()}}}
    );
    assert.equal(
      `<WorkshopPanel header={{...}}>
  <div>
    <Connect(WorkshopForm) workshop={{...}} readOnly={true}>
      <Row componentClass="div" bsClass="row">
        <Col sm={4} componentClass="div" bsClass="col">
          <ButtonToolbar bsClass="btn-toolbar">
            <Button onClick={[Function]} active={false} block={false} disabled={false} bsStyle="default" bsClass="btn">
              Back
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Connect(WorkshopForm)>
  </div>
  <ConfirmationDialog show={false} onOk={[Function]} onCancel={[Function]} headerText="Edit In Progress Workshop?" bodyText="Are you sure you want to edit this in progress workshop?\\n              Use caution! Note that deleting a session (day)\\n              will also delete all associated attendance records.\\n              " okText="OK" cancelText="Cancel" width={500} />
</WorkshopPanel>`,
      wrapper.debug(),
      wrapper.debug()
    );
  });

  it('Admin edit confirmation dialog', () => {
    const wrapper = shallow(
      <DetailsPanel
        workshop={{state: 'In Progress'}}
        isWorkshopAdmin
        onWorkshopSaved={sinon.spy()}
      />,
      {
        context: {router: {push: sinon.spy()}}
      }
    );
    wrapper.setState({showAdminEditConfirmation: true});
    assert.equal(
      `<WorkshopPanel header={{...}}>
  <div>
    <Connect(WorkshopForm) workshop={{...}} readOnly={true}>
      <Row componentClass="div" bsClass="row">
        <Col sm={4} componentClass="div" bsClass="col">
          <ButtonToolbar bsClass="btn-toolbar">
            <Button onClick={[Function]} active={false} block={false} disabled={false} bsStyle="default" bsClass="btn">
              Back
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Connect(WorkshopForm)>
  </div>
  <ConfirmationDialog show={true} onOk={[Function]} onCancel={[Function]} headerText="Edit In Progress Workshop?" bodyText="Are you sure you want to edit this in progress workshop?\\n              Use caution! Note that deleting a session (day)\\n              will also delete all associated attendance records.\\n              " okText="OK" cancelText="Cancel" width={500} />
</WorkshopPanel>`,
      wrapper.debug(),
      wrapper.debug()
    );
  });
});
