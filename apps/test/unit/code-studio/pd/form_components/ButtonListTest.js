import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
/* eslint-disable no-restricted-imports */
import {
  Radio,
  Checkbox,
  ControlLabel,
  FormGroup,
  HelpBlock,
} from 'react-bootstrap';

import ButtonList from '@cdo/apps/code-studio/pd/form_components/ButtonList';

describe('ButtonList', () => {
  describe('With type: radio', () => {
    let radioList;
    let onChangeCallback;

    beforeAll(() => {
      onChangeCallback = jest.fn();

      radioList = shallow(
        <ButtonList
          type="radio"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={['Cat', 'Dog']}
          onChange={onChangeCallback}
        />
      );
    });

    it('Renders radio buttons', () => {
      expect(
        radioList.containsMatchingElement(
          <FormGroup id="favoritePet" controlId="favoritePet">
            <ControlLabel>What is your favorite pet?</ControlLabel>
            <FormGroup>
              <Radio value="Cat" label="Cat" name="favoritePet">
                Cat
              </Radio>
              <Radio value="Dog" label="Dog" name="favoritePet">
                Dog
              </Radio>
            </FormGroup>
            <br />
          </FormGroup>
        )
      ).toBeTruthy();
    });

    it('Calls the onChange callback with a single result when one is selected', () => {
      radioList
        .find("Radio[value='Cat']")
        .simulate('change', {target: {value: 'Cat'}});
      expect(onChangeCallback).toHaveBeenCalledTimes(1);
      expect(onChangeCallback).toHaveBeenCalledWith({favoritePet: 'Cat'});
    });
  });

  describe('With type: check', () => {
    let checkboxList;
    let onChangeCallback;

    beforeEach(() => {
      onChangeCallback = jest.fn();

      checkboxList = shallow(
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={['Cat', 'Dog']}
          onChange={onChangeCallback}
        />
      );
    });

    it('Renders checkboxes', () => {
      expect(
        checkboxList.containsMatchingElement(
          <FormGroup id="favoritePet" controlId="favoritePet">
            <ControlLabel>What is your favorite pet?</ControlLabel>
            <FormGroup>
              <Checkbox value="Cat" label="Cat" name="favoritePet">
                Cat
              </Checkbox>
              <Checkbox value="Dog" label="Dog" name="favoritePet">
                Dog
              </Checkbox>
            </FormGroup>
            <br />
          </FormGroup>
        )
      ).toBeTruthy();
    });

    it('Calls the onChange callback with a list of all checked when one is checked', () => {
      // Select "Cat" initially, resulting in ["Cat"]
      checkboxList
        .find("Checkbox[value='Cat']")
        .simulate('change', {target: {value: 'Cat', checked: true}});
      expect(onChangeCallback).toHaveBeenCalledTimes(1);
      expect(onChangeCallback).toHaveBeenCalledWith({favoritePet: ['Cat']});
    });

    it('Calls the onChange callback with a list of all remaining checked when one is unchecked', () => {
      // Unselect "Cat" from ["Cat", "Dog"], resulting in ["Dog"]
      checkboxList.setProps({selectedItems: ['Cat', 'Dog']});
      checkboxList
        .find("Checkbox[value='Cat']")
        .simulate('change', {target: {value: 'Cat', checked: false}});
      expect(onChangeCallback).toHaveBeenCalledTimes(1);
      expect(onChangeCallback).toHaveBeenCalledWith({favoritePet: ['Dog']});
    });

    it('Calls the onChange callback with null when the last checked item is unchecked', () => {
      // Unselect "Cat" from ["Cat"], resulting in null
      checkboxList.setProps({selectItems: ['Cat']});
      checkboxList
        .find("Checkbox[value='Cat']")
        .simulate('change', {target: {value: 'Cat', checked: false}});
      expect(onChangeCallback).toHaveBeenCalledTimes(1);
      expect(onChangeCallback).toHaveBeenCalledWith({favoritePet: null});
    });
  });

  it('Displays a help block if errorText is provided', () => {
    const buttonList = shallow(
      <ButtonList
        type="check"
        label="What is your favorite pet?"
        groupName="favoritePet"
        answers={['Cat', 'Dog']}
        errorText="You must choose!"
      />
    );

    const helpBlock = buttonList.find(HelpBlock);
    expect(helpBlock).toHaveLength(1);
    expect(helpBlock.childAt(0).text()).toBe('You must choose!');
  });

  it('Adds an other option when includeOther is set', () => {
    const buttonList = shallow(
      <ButtonList
        type="check"
        label="What is your favorite pet?"
        groupName="favoritePet"
        answers={['Cat', 'Dog']}
        includeOther={true}
      />
    );

    const checkboxes = buttonList.find(Checkbox);
    expect(checkboxes).toHaveLength(3);
    const otherCheckbox = checkboxes.at(2);
    expect(
      otherCheckbox.containsMatchingElement(
        <Checkbox>
          <div>
            <span>Other:</span>
            &nbsp;
            <input type="text" id="favoritePet_other" maxLength="200" />
          </div>
        </Checkbox>
      )
    ).toBeTruthy();
  });

  describe('With input fields', () => {
    let buttonList;
    let onDogBreedInputChange;
    let dogBreedInput;

    beforeAll(() => {
      onDogBreedInputChange = jest.fn();

      buttonList = shallow(
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            'Cat',
            {
              answerText: 'Specific dog breed',
              inputId: 'dog-breed-input',
              inputValue: '--enter dog breed--',
              onInputChange: onDogBreedInputChange,
            },
          ]}
        />
      );

      dogBreedInput = buttonList.find("input[id='dog-breed-input']");
    });

    it('Renders correctly', () => {
      expect(
        buttonList.containsMatchingElement(
          <FormGroup>
            <Checkbox value="Cat" label="Cat" name="favoritePet">
              Cat
            </Checkbox>
            <Checkbox
              value="Specific dog breed"
              label="Specific dog breed"
              name="favoritePet"
            >
              <div>
                <span>Specific dog breed</span>
                &nbsp;
                <input type="text" id="dog-breed-input" maxLength="200" />
              </div>
            </Checkbox>
          </FormGroup>
        )
      ).toBeTruthy();
    });

    it('Displays supplied input value', () => {
      expect(dogBreedInput.prop('value')).toBe('--enter dog breed--');
    });

    it('Calls the onInputChange callback when text is entered', () => {
      dogBreedInput.simulate('change', {target: {value: 'all dogs'}});

      expect(onDogBreedInputChange).toHaveBeenCalledTimes(1);
      expect(onDogBreedInputChange).toHaveBeenCalledWith('all dogs');
    });
  });
});
