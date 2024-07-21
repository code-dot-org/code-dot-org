import {isolateComponent} from 'isolate-react';
import React from 'react';

import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';

const isolateCallToAction = props =>
  isolateComponent(
    <PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} {...props} />
  );

describe('PetitionCallToAction', () => {
  it('has a petition message', () => {
    expect(isolateCallToAction().findAll('#petition-message')).toHaveLength(1);
  });
  it('has a message to sign the petition', () => {
    expect(isolateCallToAction().findAll('#sign-message')).toHaveLength(1);
  });
  it('has a petition form', () => {
    expect(isolateCallToAction().findAll('PetitionForm')).toHaveLength(1);
  });
});
