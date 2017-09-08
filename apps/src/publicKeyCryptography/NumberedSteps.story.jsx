import React from 'react';
import NumberedSteps, {Step} from './NumberedSteps';

export default storybook => storybook
  .storiesOf('NumberedSteps', module)
  .addStoryTable([
    {
      name: 'Steps with prerequisites',
      description: `You can pass requirements to each step.  Steps with
        unmet requirements (null or undefined) will be displayed at 20%
        opacity.`,
      story: () => (
        <NumberedSteps>
          <Step requires={['something', 'something else'].every(s => typeof s === 'string')}>
            Step with all requirements met.
          </Step>
          <Step requires={[true, true, false].every(x => x)}>
            Step with an unmet requirement
          </Step>
        </NumberedSteps>)
    },
    {
      name: 'Fade effect',
      description: `Steps fade in and out as their requirements are met/unmet`,
      story: () => {
        class FadeEffectExample extends React.Component {
          state = {};

          onToggleStep1 = () => this.setState({step1Done: !this.state.step1Done});

          onToggleStep2 = () => this.setState({step2Done: !this.state.step2Done});

          onToggleStep3 = () => this.setState({step3Done: !this.state.step3Done});

          render() {
            const {step1Done, step2Done, step3Done} = this.state;
            return (
              <NumberedSteps>
                <Step>
                  Click to complete this step: <a href="#" onClick={this.onToggleStep1}>{step1Done ? '' : 'Not'} Done</a>
                </Step>
                <Step requires={step1Done}>
                  This step depends only on step one.
                  <br/>Click to complete this step: <a href="#" onClick={this.onToggleStep2}>{step2Done ? '' : 'Not'} Done</a>
                </Step>
                <Step requires={step2Done}>
                  This step depends only on step two.
                  <br/>Click to complete this step: <a href="#" onClick={this.onToggleStep3}>{step3Done ? '' : 'Not'} Done</a>
                </Step>
                <Step requires={step1Done && step2Done && step3Done}>
                  This step depends on all preceding steps.
                </Step>
              </NumberedSteps>
            );
          }
        }
        return <FadeEffectExample/>;
      }
    },
    {
      name: 'Holds any content',
      description: `By default, NumberedSteps just works like an <ol> element
        with particular spacing and styling.`,
      story: () => (
        <NumberedSteps>
          <Step>
            Arbitrary content here.
            <p>With multiple lines.</p>
          </Step>
          <Step>
            More arbitrary content here.
          </Step>
        </NumberedSteps>)
    }
  ]);
