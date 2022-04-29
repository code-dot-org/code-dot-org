import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';
import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';

describe('PetitionCallToAction', () => {
  it('has a petition message', () => {
    const callToAction = isolateComponent(<PetitionCallToAction />);
    expect(callToAction.findOne('#petition-message').content()).to.exist;
  });
  it('has a message to sign the petition', () => {
    const callToAction = isolateComponent(<PetitionCallToAction />);
    expect(callToAction.findOne('#sign-message').content()).to.exist;
  });
});
