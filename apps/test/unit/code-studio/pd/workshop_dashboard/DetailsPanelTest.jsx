import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import DetailsPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/DetailsPanel';

describe('DetailsPanel', () => {
  it('renders in readonly view', () => {
    const wrapper = shallow(
      <DetailsPanel workshop={{}} onWorkshopSaved={sinon.spy()} />,
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
        workshop={{}}
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
</WorkshopPanel>`,
      wrapper.debug(),
      wrapper.debug()
    );
  });
});
