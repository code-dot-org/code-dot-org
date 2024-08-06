import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import {mapValues} from 'lodash';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('Petition on submit', () => {
  const minimumInputs = {
    name_s: {
      tag: 'input',
      id: 'name',
      target_value: 'Petition Signer',
    },
    email_s: {
      tag: 'input',
      id: 'email',
      target_value: 'ps@code.org',
    },
    age_i: {
      tag: 'select',
      id: 'age',
      target_value: '16',
    },
  };

  const addInputsToPetition = (wrapper, inputs) =>
    Object.keys(inputs).forEach(name => {
      wrapper
        .find(`${inputs[name].tag}#${inputs[name].id}`)
        .simulate('change', {
          target: {name: name, value: inputs[name].target_value},
        });
    });

  const expectedDataFromInputs = inputs => ({
    name_s: '',
    email_s: '',
    zip_code_or_country_s: '',
    age_i: '',
    role_s: 'other',
    ...mapValues(inputs, input => input.target_value),
  });

  const submitForm = wrapper =>
    wrapper
      .find('form')
      .props()
      .onSubmit({preventDefault: () => {}});

  const mountPetition = () =>
    mount(<PetitionCallToAction gaPagePath={'/congrats/coursetest-2030'} />);

  beforeEach(() => {
    sinon.spy($, 'ajax');
    window.ga = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
    window.ga = undefined;
  });

  it('does not send request if there are invalid fields', () => {
    const petition = mountPetition();
    submitForm(petition);

    expect($.ajax).to.not.have.been.called;
  });
  it('sends request if all required fields are valid', () => {
    const petition = mountPetition();
    addInputsToPetition(petition, minimumInputs);
    submitForm(petition);

    const serverCalledWith = $.ajax.getCall(0).args[0];
    expect(JSON.parse(serverCalledWith.data)).to.deep.equal(
      expectedDataFromInputs(minimumInputs)
    );
  });
  it('sends request with name and email anonymized if under 16', () => {
    const petition = mountPetition();
    const inputs = {
      ...minimumInputs,
      age_i: {
        tag: 'select',
        id: 'age',
        target_value: '15',
      },
    };
    addInputsToPetition(petition, inputs);
    submitForm(petition);

    const serverCalledWith = $.ajax.getCall(0).args[0];
    expect(JSON.parse(serverCalledWith.data)).to.deep.equal({
      ...expectedDataFromInputs(inputs),
      name_s: '',
      email_s: 'anonymous@code.org',
    });
  });
  it('sends request with all inputs filled', () => {
    const petition = mountPetition();
    const inputs = {
      ...minimumInputs,
      role_s: {
        tag: 'select',
        id: 'profession',
        target_value: 'Software Engineer',
      },
      zip_code_or_country_s: {
        tag: 'input',
        id: 'zip-or-country',
        target_value: 'MX',
      },
    };
    addInputsToPetition(petition, inputs);
    submitForm(petition);

    const serverCalledWith = $.ajax.getCall(0).args[0];
    expect(JSON.parse(serverCalledWith.data)).to.deep.equal({
      ...expectedDataFromInputs(inputs),
      role_s: 'engineer', // The 'role' value has a consistent name regardless of language
    });
  });
  it('reports to google analytics if successful submit', () => {
    const petition = mountPetition();
    addInputsToPetition(petition, minimumInputs);
    submitForm(petition);

    sinon.assert.calledOnce(window.ga);
  });
  it('does not report to google analytics if unsuccessful submit', () => {
    const petition = mountPetition();
    submitForm(petition);
    sinon.assert.notCalled(window.ga);
  });
});
