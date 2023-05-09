import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ControlButtons from '@cdo/apps/javalab/ControlButtons';

describe('Java Lab Control Buttons Test', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      isRunning: false,
      isTesting: false,
      toggleRun: () => {},
      toggleTest: () => {},
      isEditingStartSources: false,
      disableFinishButton: false,
      onContinue: () => {},
      disableRunButton: false,
      disableTestButton: false,
      showTestButton: true,
      isSubmittable: false,
      isSubmitted: false,
    };
  });

  it('submit button for unsubmitted submittable level', () => {
    const wrapper = shallow(
      <ControlButtons {...defaultProps} isSubmittable isSubmitted={false} />
    );
    const submitButton = wrapper.find('#submitButton');
    expect(submitButton).to.not.be.null;
    expect(submitButton.props().text).to.equal('Submit');
    expect(submitButton.props().onClick).to.be.null;
  });

  it('finish button says finish for non-submittable level', () => {
    const wrapper = shallow(
      <ControlButtons {...defaultProps} isSubmittable={false} />
    );
    const finishButton = wrapper.find('#finishButton');
    expect(finishButton).to.not.be.null;
    expect(finishButton.props().text).to.equal('Finish');
    expect(finishButton.props().onClick).to.not.be.null;
  });

  it('disables run button if disableRunButton is true', () => {
    const wrapper = shallow(
      <ControlButtons {...defaultProps} disableRunButton />
    );
    const runButton = wrapper.find('#runButton');
    expect(runButton.props().isDisabled).to.be.true;
  });

  it('disables test button if disableTestButton is true', () => {
    const wrapper = shallow(
      <ControlButtons {...defaultProps} disableTestButton />
    );
    const testButton = wrapper.find('#testButton');
    expect(testButton.props().isDisabled).to.be.true;
  });

  it('hides test button if showTestButton is false', () => {
    const wrapper = shallow(
      <ControlButtons {...defaultProps} showTestButton={false} />
    );
    const testButton = wrapper.find('#testButton');
    expect(testButton).to.be.empty;
  });
});
