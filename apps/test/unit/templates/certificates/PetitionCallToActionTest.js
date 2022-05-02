import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';
import PetitionForm from '@cdo/apps/templates/certificates/petition/PetitionForm';
import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';

describe('PetitionCallToAction', () => {
  it('has a petition message', () => {
    const callToAction = isolateComponent(<PetitionCallToAction />);
    expect(
      callToAction.findOne('#petition-message').content().length
    ).to.be.greaterThan(0);
  });
  it('has a message to sign the petition', () => {
    const callToAction = isolateComponent(<PetitionCallToAction />);
    expect(
      callToAction.findOne('#sign-message').content().length
    ).to.be.greaterThan(0);
  });
  it('has a form with submit button', () => {
    const callToActionWithForm = isolateComponent(<PetitionCallToAction />);
    callToActionWithForm.inline(PetitionForm);
    const form = callToActionWithForm.findOne('form');
    expect(form.findOne('Button').content().length).to.be.greaterThan(0);
  });
  it('has a form with five fields ', () => {
    // TODO: Once the request is being made,
    //  refactor this to instead check that the request is sending the correct data
    const callToActionWithForm = isolateComponent(<PetitionCallToAction />);
    callToActionWithForm.inline(PetitionForm);
    const fields = callToActionWithForm.findAll('ControlledFieldGroup');
    expect(fields).to.have.length(5);
  });
});
