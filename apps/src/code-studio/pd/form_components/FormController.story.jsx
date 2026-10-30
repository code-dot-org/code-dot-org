import {action} from '@storybook/addon-actions';
import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

import FormComponent from './FormComponent';
import FormController from './FormController';

class TestPageOne extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page One</h4>
        {this.buildButtonsFromOptions({
          name: 'one',
          label: 'Input One',
          type: 'check',
        })}
      </FormGroup>
    );
  }
}

TestPageOne.associatedFields = ['one'];

class TestPageTwo extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page Two</h4>
        {this.buildButtonsFromOptions({
          name: 'two',
          label: 'Input Two',
          type: 'radio',
        })}
      </FormGroup>
    );
  }
}

TestPageTwo.associatedFields = ['two'];

class TestPageThree extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page Three</h4>
        {this.buildSelectFieldGroupFromOptions({
          name: 'three',
          label: 'Input Three',
        })}
      </FormGroup>
    );
  }
}

TestPageThree.associatedFields = ['three'];

class TestPageFour extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page Four</h4>
        {this.buildFieldGroup({
          name: 'four',
          label: 'Input Four',
          type: 'text',
        })}
      </FormGroup>
    );
  }
}

TestPageFour.associatedFields = ['four'];

class TestController extends FormController {
  getPageComponents() {
    return [TestPageOne, TestPageTwo, TestPageThree, TestPageFour];
  }

  /**
   * @override
   */
  handleChange(newState) {
    this.props.action('onChange')(newState);
    super.handleChange(newState);
  }

  /**
   * @override
   */
  handleSubmit(event) {
    this.props.action('submit')(this.serializeFormData());
    event.preventDefault();
  }
}

const OPTIONS = {
  one: ['First', 'Second', 'Third'],
  two: ['Fourth', 'Fifth', 'Sixth'],
  three: ['Seventh', 'Eighth', 'Ninth'],
};

export default {
  component: FormController,
  decorators: [reactBootstrapStoryDecorator],
};

export const FormWithRadioButtons = () => {
  return (
    <TestPageOne
      options={{
        one: OPTIONS.one,
      }}
      onChange={action('onChange')}
      errors={[]}
      errorMessages={{}}
      data={{}}
    />
  );
};

export const FormWithCheckButtons = () => {
  return (
    <TestPageTwo
      options={{
        two: OPTIONS.two,
      }}
      onChange={action('onChange')}
      errors={[]}
      errorMessages={{}}
      data={{}}
    />
  );
};

export const FormWithSelectDropdown = () => {
  return (
    <TestPageThree
      options={{
        three: OPTIONS.three,
      }}
      onChange={action('onChange')}
      errors={[]}
      errorMessages={{}}
      data={{}}
    />
  );
};

export const GeneratedTextInput = () => {
  return (
    <TestPageFour
      options={{}}
      onChange={action('onChange')}
      errors={[]}
      errorMessages={{}}
      data={{}}
    />
  );
};

export const MultiPageForm = () => {
  return (
    <TestController apiEndpoint="" options={OPTIONS} requiredFields={[]} />
  );
};
