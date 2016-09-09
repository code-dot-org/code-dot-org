/** Auto-numbered table of arbitrary components, used for character steps */
import React from 'react';
import {AnyChildren} from './types';
import {LINE_HEIGHT} from './style';

const style = {
  td: {
    verticalAlign: 'top',
    // lineHeight does not get the automatic 'px' suffix
    // see https://facebook.github.io/react/tips/style-props-value-px.html
    lineHeight: `${LINE_HEIGHT}px`,
    paddingBottom: 8
  }
};

export default function NumberedSteps(props) {
  return (
    <table>
      <tbody>
        {React.Children.map(props.children, (child, index) => React.cloneElement(child, {index}))}
      </tbody>
    </table>);
}
NumberedSteps.propTypes = {
  children: AnyChildren
};

/**
 * Replacement for a 'div' in a NumberedSteps list.
 * Accepts a 'requires' prop that takes a value - if falsy, the step will
 * be faded out.
 */
export function Step(props) {
  const isStepEnabled = props.hasOwnProperty('requires') ? props.requires : true;
  const trStyle = {
    transition: 'opacity 0.5s',
    opacity: isStepEnabled ? 1 : 0.2
  };
  return (
    <tr style={trStyle}>
      <td style={style.td}>{(props.index + 1) + ')'}</td>
      <td style={style.td}>{props.children}</td>
    </tr>);
}
Step.propTypes = {
  index: React.PropTypes.number,
  children: AnyChildren,
  requires: React.PropTypes.bool
};
Step.defaultProps = {
  index: 0
};

if (BUILD_STYLEGUIDE) {
  NumberedSteps.styleGuideExamples = storybook => {
    return storybook
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
            const FadeEffectExample = React.createClass({
              getInitialState() {
                return {};
              },

              onToggleStep1() {
                this.setState({step1Done: !this.state.step1Done});
              },

              onToggleStep2() {
                this.setState({step2Done: !this.state.step2Done});
              },

              onToggleStep3() {
                this.setState({step3Done: !this.state.step3Done});
              },

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
                  </NumberedSteps>);
              }
            });
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
  };
}
