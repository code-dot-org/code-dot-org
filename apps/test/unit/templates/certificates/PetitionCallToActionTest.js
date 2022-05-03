import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';
import PetitionForm from '@cdo/apps/templates/certificates/petition/PetitionForm';
import ControlledFieldGroup from '@cdo/apps/templates/certificates/petition/ControlledFieldGroup';
import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import $ from 'jquery';

const isolateCallToAction = props =>
  isolateComponent(
    <PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} {...props} />
  );

describe('PetitionCallToAction', () => {
  it('has a petition message', () => {
    expect(
      isolateCallToAction()
        .findOne('#petition-message')
        .content().length
    ).to.be.greaterThan(0);
  });
  it('has a message to sign the petition', () => {
    expect(
      isolateCallToAction()
        .findOne('#sign-message')
        .content().length
    ).to.be.greaterThan(0);
  });
  it('has a form with submit button', () => {
    const callToActionWithForm = isolateCallToAction();
    callToActionWithForm.inline(PetitionForm);
    const form = callToActionWithForm.findOne('form');
    expect(form.findOne('Button').content().length).to.be.greaterThan(0);
  });
  it('does not send request if there are invalid fields', () => {
    const requestSpy = sinon.spy($, 'ajax');

    const callToActionWithForm = isolateCallToAction();
    callToActionWithForm.inline(PetitionForm);
    const form = callToActionWithForm.findOne('form');
    form.props.onSubmit({preventDefault: sinon.stub()});

    expect(requestSpy).to.have.been.notCalled;
    $.ajax.restore();
  });
  it('sends request if there are no invalid fields', () => {
    const requestSpy = sinon.spy($, 'ajax');
    sinon.stub();

    const callToActionWithForm = isolateCallToAction();
    callToActionWithForm.inline(PetitionForm);
    // callToActionWithForm.inline(ControlledFieldGroup);
    // ^^ If I do this, I get that fields[0].props is empty, so I can't do the props.onChange
    const form = callToActionWithForm.findOne('form');

    const fields = callToActionWithForm.findAll(ControlledFieldGroup);
    console.log('form is', form);
    console.log(fields.length, fields[0].props);
    fields[0].props.onChange({
      persist: sinon.stub(),
      target: {name: 'name', value: 'fake name'}
    });
    form.props.onSubmit({preventDefault: sinon.stub()});
    fields[1].props.onChange({
      persist: sinon.stub(),
      target: {name: 'email', value: 'fake@code.org'}
    });
    form.props.onSubmit({preventDefault: sinon.stub()});
    const ageField = callToActionWithForm.findOne('#age');
    // ^^ This is a clearer way to get the field we want, but it doesn't work if I use `.inline(ControlledFieldGroup)`
    ageField.props.onChange({
      persist: sinon.stub(),
      target: {name: 'age', value: '20'}
    });

    form.props.onSubmit({preventDefault: sinon.stub()});
    expect(requestSpy).to.have.been.calledOnce;
    $.ajax.restore();
  });
});
