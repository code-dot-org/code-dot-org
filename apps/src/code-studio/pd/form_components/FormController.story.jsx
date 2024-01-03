import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import FormComponent from './FormComponent';
import FormController from './FormController';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';
import {action} from '@storybook/addon-actions';

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

export default storybook => {
  storybook
    .storiesOf('FormComponents/FormComponent', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'simple form with generated radio buttons',
        story: () => (
          <TestPageOne
            options={{
              one: OPTIONS.one,
            }}
            onChange={action('onChange')}
            errors={[]}
            errorMessages={{}}
            data={{}}
          />
        ),
      },
      {
        name: 'simple form with generated check buttons',
        story: () => (
          <TestPageTwo
            options={{
              two: OPTIONS.two,
            }}
            onChange={action('onChange')}
            errors={[]}
            errorMessages={{}}
            data={{}}
          />
        ),
      },
      {
        name: 'simple form with generated select dropdown',
        story: () => (
          <TestPageThree
            options={{
              three: OPTIONS.three,
            }}
            onChange={action('onChange')}
            errors={[]}
            errorMessages={{}}
            data={{}}
          />
        ),
      },
      {
        name: 'simple form with generated text input',
        story: () => (
          <TestPageFour
            options={{}}
            onChange={action('onChange')}
            errors={[]}
            errorMessages={{}}
            data={{}}
          />
        ),
      },
    ]);

  storybook
    .storiesOf('FormComponents/FormController', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'simple multi-page form',
        story: () => (
          <TestController
            storybook={storybook}
            apiEndpoint=""
            options={OPTIONS}
            requiredFields={[]}
          />
        ),
      },
    ]);
};
