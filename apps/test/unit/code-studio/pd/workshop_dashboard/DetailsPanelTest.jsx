import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import DetailsPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/DetailsPanel';

describe('DetailsPanel', () => {
  it('renders in readonly view', () => {
    const wrapper = shallow(
      <DetailsPanel
        workshop={{state: 'In Progress'}}
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
  <ConfirmationDialog show={[undefined]} onOk={[Function]} onCancel={[Function]} headerText="Edit In Progress Workshop?" bodyText="Are you sure you want to edit this in progress workshop?\\n              Use caution! Note that deleting a session (day)\\n              will also delete all associated attendance records.\\n              " okText="OK" cancelText="Cancel" width={500} />
</WorkshopPanel>`,
      wrapper.debug(),
      wrapper.debug()
    );
  });

  it('shows the edit button when the workshop is in "Not Started" state', () => {
    const wrapper = shallow(
      <DetailsPanel
        workshop={{state: 'Not Started'}}
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
              Edit
            </Button>
            <Button onClick={[Function]} active={false} block={false} disabled={false} bsStyle="default" bsClass="btn">
              Back
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Connect(WorkshopForm)>
  </div>
  <ConfirmationDialog show={[undefined]} onOk={[Function]} onCancel={[Function]} headerText="Edit Not Started Workshop?" bodyText="Are you sure you want to edit this not started workshop?\\n              Use caution! Note that deleting a session (day)\\n              will also delete all associated attendance records.\\n              " okText="OK" cancelText="Cancel" width={500} />
</WorkshopPanel>`,
      wrapper.debug(),
      wrapper.debug()
    );
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
