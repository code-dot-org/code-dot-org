import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';
import PetitionForm from '@cdo/apps/templates/certificates/petition/PetitionForm';
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
});
