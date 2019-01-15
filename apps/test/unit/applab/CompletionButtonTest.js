import React from 'react';
import {expect} from '../../util/configuredChai';
import {mount} from 'enzyme';
import {UnconnectedCompletionButton as CompletionButton} from '@cdo/apps/templates/CompletionButton';

describe('CompletionButton', () => {

  it('non-project level, can submit, havent', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={true}
        isSubmitted={false}
      />
    );
    const button = completionButton.find('button');
    expect(button).to.have.length(1);
    expect(button.props().id).to.equal('submitButton');
    expect(button.text()).to.equal('Submit');
  });

  it('non-project level, can submit, have', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={true}
        isSubmitted={true}
      />
    );
    const button = completionButton.find('button');
    expect(button).to.have.length(1);
    expect(button.props().id).to.equal('unsubmitButton');
    expect(button.text()).to.equal('Unsubmit');
  });

  it('non-project level, cant submit', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={false}
        isSubmitted={false}
      />
    );
    const button = completionButton.find('button');
    expect(button).to.have.length(1);
    expect(button.props().id).to.equal('finishButton');
    expect(button.text()).to.equal('Finish');
  });

  it('project level (cant submit)', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={true}
        isSubmittable={false}
        isSubmitted={false}
      />
    );
    const button = completionButton.find('button');
    expect(button).to.have.length(0);
  });
});
