import React from 'react';
import {FormGroup} from 'react-bootstrap';
import FormComponent from './FormComponent';
import FormController from './FormController';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

class TestPageOne extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page One</h4>
        {this.buildButtonsFromOptions({
          name: 'one',
          label: "Input One",
          type: 'check'
        })}
      </FormGroup>
    );
  }
}

TestPageOne.associatedFields = ["one"];

class TestPageTwo extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page Two</h4>
        {this.buildButtonsFromOptions({
          name: 'two',
          label: "Input Two",
          type: 'radio'
        })}
      </FormGroup>
    );
  }
}

TestPageTwo.associatedFields = ["two"];

class TestPageThree extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page Three</h4>
        {this.buildSelectFieldGroupFromOptions({
          name: 'three',
          label: "Input Three",
        })}
      </FormGroup>
    );
  }
}

TestPageThree.associatedFields = ["three"];

class TestPageFour extends FormComponent {
  render() {
    return (
      <FormGroup>
        <h4>Page Four</h4>
        {this.buildFieldGroup({
          name: 'four',
          label: "Input Four",
          type: 'text'
        })}
      </FormGroup>
    );
  }
}

TestPageFour.associatedFields = ["four"];

class TestController extends FormController {
  getPageComponents() {
    return [
      TestPageOne,
      TestPageTwo,
      TestPageThree,
      TestPageFour,
    ];
  }

  /**
   * @override
   */
  handleChange(newState) {
    this.props.storybook.action('onChange')(newState);
    super.handleChange(newState);
  }

  /**
   * @override
   */
  handleSubmit(event) {
    this.props.storybook.action('submit')(this.serializeFormData());
    event.preventDefault();
  }
}

const OPTIONS = {
  one: ["First", "Second", "Third"],
  two: ["Fourth", "Fifth", "Sixth"],
  three: ["Seventh", "Eighth", "Ninth"]
};


export default storybook => {
  storybook
    .storiesOf('FormComponent', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([{
      name: 'simple form with generated radio buttons',
      story: () => (
        <TestPageOne
          options={{
            one: OPTIONS.one
          }}
          onChange={storybook.action('onChange')}
          errors={[]}
          data={{}}
        />
      )
    }, {
      name: 'simple form with generated check buttons',
      story: () => (
        <TestPageTwo
          options={{
            two: OPTIONS.two
          }}
          onChange={storybook.action('onChange')}
          errors={[]}
          data={{}}
        />
      )
    }, {
      name: 'simple form with generated select dropdown',
      story: () => (
        <TestPageThree
          options={{
            three: OPTIONS.three
          }}
          onChange={storybook.action('onChange')}
          errors={[]}
          data={{}}
        />
      )
    }, {
      name: 'simple form with generated text input',
      story: () => (
        <TestPageFour
          options={{}}
          onChange={storybook.action('onChange')}
          errors={[]}
          data={{}}
        />
      )
    }]);

  storybook
    .storiesOf('FormController', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([{
      name: 'simple multi-page form',
      story: () => (
        <TestController
          storybook={storybook}
          apiEndpoint=""
          options={OPTIONS}
        />
      )
    }]);
};
