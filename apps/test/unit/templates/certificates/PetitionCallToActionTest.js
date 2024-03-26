import {isolateComponent} from 'isolate-react';
import React from 'react';

import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';

import {expect} from '../../../util/reconfiguredChai';

const isolateCallToAction = props =>
  isolateComponent(
    <PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} {...props} />
  );

describe('PetitionCallToAction', () => {
  it('has a petition message', () => {
    expect(isolateCallToAction().findAll('#petition-message')).to.have.length(
      1
    );
  });
  it('has a message to sign the petition', () => {
    expect(isolateCallToAction().findAll('#sign-message')).to.have.length(1);
  });
  it('has a petition form', () => {
    expect(isolateCallToAction().findAll('PetitionForm')).to.have.length(1);
  });
});
