import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {mapValues} from 'lodash';
import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';
import sinon from 'sinon';
import $ from 'jquery';

describe('Petition', () => {
  const minimumInputs = {
    name_s: {
      tag: 'input',
      id: 'name',
      target_value: 'Petition Signer'
    },
    email_s: {
      tag: 'input',
      id: 'email',
      target_value: 'ps@code.org'
    },
    age_i: {
      tag: 'select',
      id: 'age',
      target_value: '16'
    }
  };

  const minimalDataShape = {
    name_s: '',
    email_s: '',
    zip_code_or_country_s: '',
    age_i: '',
    role_s: 'other'
  };

  const ageSafeData = {
    name_s: '',
    email_s: 'anonymous@code.org'
  };

  const addInputsToPetition = (wrapper, inputs) =>
    Object.keys(inputs).forEach(name => {
      wrapper
        .find(`${inputs[name].tag}#${inputs[name].id}`)
        .simulate('change', {
          target: {name: name, value: inputs[name].target_value}
        });
    });

  const expectedDataFromInputs = inputs => ({
    ...minimalDataShape,
    ...mapValues(inputs, input => input.target_value)
  });

  const submitForm = wrapper =>
    wrapper
      .find('form')
      .props()
      .onSubmit({preventDefault: () => {}});

  beforeEach(() => {
    sinon.spy($, 'ajax');
    window.ga = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
    window.ga = undefined;
  });

  it('does not send request if there are invalid fields', () => {
    const petition = mount(
      <PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} />
    );
    submitForm(petition);

    expect($.ajax).to.not.have.been.called;
  });
  it('sends request if all required fields are valid', () => {
    const petition = mount(
      <PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} />
    );
    addInputsToPetition(petition, minimumInputs);
    submitForm(petition);

    const serverCalledWith = $.ajax.getCall(0).args[0];
    expect(serverCalledWith.data).to.deep.equal(
      expectedDataFromInputs(minimumInputs)
    );
  });
  it('sends request with name and email anonymized if under 16', () => {
    const petition = mount(
      <PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} />
    );
    const inputs = {
      ...minimumInputs,
      age_i: {
        tag: 'select',
        id: 'age',
        target_value: '15'
      }
    };
    addInputsToPetition(petition, inputs);
    submitForm(petition);

    const serverCalledWith = $.ajax.getCall(0).args[0];
    expect(serverCalledWith.data).to.deep.equal({
      ...expectedDataFromInputs(inputs),
      ...ageSafeData
    });
  });
});
