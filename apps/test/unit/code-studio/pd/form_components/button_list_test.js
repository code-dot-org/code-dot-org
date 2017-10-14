import ButtonList from '@cdo/apps/code-studio/pd/form_components/button_list';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {
  Radio,
  Checkbox,
  ControlLabel,
  FormGroup,
  HelpBlock
} from 'react-bootstrap';

describe("ButtonList", () => {
  describe("With type: radio", () => {
    let radioList;
    let onChangeCallback;

    before(() => {
      onChangeCallback = sinon.spy();

      radioList = shallow(
        <ButtonList
          type="radio"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            "Dog"
          ]}
          onChange={onChangeCallback}
        />
      );
    });

    it("Renders radio buttons", () => {
      expect(radioList).to.containMatchingElement(
        <FormGroup id="favoritePet" controlId="favoritePet">
          <ControlLabel>
            What is your favorite pet?
          </ControlLabel>
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
      );
    });

    it("Calls the onChange callback with a single result when one is selected", () => {
      radioList.find("Radio[value='Cat']").simulate("change", {target: {value: "Cat"}});
      expect(onChangeCallback).to.have.been.calledOnce;
      expect(onChangeCallback).to.have.been.calledWith({favoritePet: "Cat"});
    });
  });

  describe("With type: check", () => {
    let checkboxList;
    let onChangeCallback;

    before(() => {
      onChangeCallback = sinon.spy();

      checkboxList = shallow(
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            "Dog"
          ]}
          onChange={onChangeCallback}
        />
      );
    });

    it("Renders checkboxes", () => {
      expect(checkboxList).to.containMatchingElement(
        <FormGroup id="favoritePet" controlId="favoritePet">
          <ControlLabel>
            What is your favorite pet?
          </ControlLabel>
          <FormGroup>
            <Checkbox value="Cat" label="Cat" name="favoritePet">
              Cat
            </Checkbox>
            <Checkbox value="Dog" label="Dog" name="favoritePet">
              Dog
            </Checkbox>
          </FormGroup>
          <br/>
        </FormGroup>
      );
    });

    it("Calls the onChange callback with a list of all checked when one is changed", () => {
      // Select "Cat" from [], resulting in ["Cat"]
      checkboxList.find("Checkbox[value='Cat']").simulate("change", {target: {value: "Cat", checked: true}});
      expect(onChangeCallback).to.have.been.calledOnce;
      expect(onChangeCallback).to.have.been.calledWith({favoritePet: ["Cat"]});

      // Unselect "Cat" from ["Cat", "Dog"], resulting in ["Dog"]
      checkboxList.setProps({selectedItems: ["Cat", "Dog"]});
      onChangeCallback.reset();
      checkboxList.find("Checkbox[value='Cat']").simulate("change", {target: {value: "Cat", checked: false}});
      expect(onChangeCallback).to.have.been.calledOnce;
      expect(onChangeCallback).to.have.been.calledWith({favoritePet: ["Dog"]});
    });
  });

  it("Displays a help block if errorText is provided", () => {
    const buttonList = shallow(
      <ButtonList
        type="check"
        label="What is your favorite pet?"
        groupName="favoritePet"
        answers={[
          "Cat",
          "Dog"
        ]}
        errorText="You must choose!"
      />
    );

    const helpBlock = buttonList.find(HelpBlock);
    expect(helpBlock).to.have.length(1);
    expect(helpBlock.childAt(0)).to.have.text("You must choose!");
  });

  it("Adds an other option when includeOther is set", () => {
    const buttonList = shallow(
      <ButtonList
        type="check"
        label="What is your favorite pet?"
        groupName="favoritePet"
        answers={[
          "Cat",
          "Dog"
        ]}
        includeOther={true}
      />
    );

    const checkboxes = buttonList.find(Checkbox);
    expect(checkboxes).to.have.length(3);
    const otherCheckbox = checkboxes.at(2);
    expect(otherCheckbox).to.containMatchingElement(
      <Checkbox>
        <div>
          <span>Other: </span>
          &nbsp;
          <input type="text" id="favoritePet_other" maxLength="1000" />
        </div>
      </Checkbox>
    );
  });

  describe("With input fields", () => {
    let buttonList;
    let onDogBreedInputChange;
    let dogBreedInput;

    before(() => {
      onDogBreedInputChange = sinon.spy();

      buttonList = shallow(
        <ButtonList
          type="check"
          label="What is your favorite pet?"
          groupName="favoritePet"
          answers={[
            "Cat",
            {
              answerText: "Specific dog breed",
              inputId: "dog-breed-input",
              inputValue: "--enter dog breed--",
              onInputChange: onDogBreedInputChange
            }
          ]}
        />
      );

      dogBreedInput = buttonList.find("input[id='dog-breed-input']");
    });

    it("Renders correctly", () => {
      expect(buttonList).to.containMatchingElement(
        <FormGroup>
          <Checkbox value="Cat" label="Cat" name="favoritePet">
            Cat
          </Checkbox>
          <Checkbox value="Specific dog breed" label="Specific dog breed" name="favoritePet">
            <div>
              <span>Specific dog breed</span>
              &nbsp;
              <input type="text" id="dog-breed-input" maxLength="1000" />
            </div>
          </Checkbox>
        </FormGroup>
      );
    });

    it("Displays supplied input value", () => {
      expect(dogBreedInput).to.have.prop("value", "--enter dog breed--");
    });

    it("Calls the onInputChange callback when text is entered", () => {
      dogBreedInput.simulate("change", {target: {value: "all dogs"}});

      expect(onDogBreedInputChange).to.have.been.calledOnce;
      console.log(onDogBreedInputChange.args);
      expect(onDogBreedInputChange).to.have.been.calledWith("all dogs");
    });
  });
});
