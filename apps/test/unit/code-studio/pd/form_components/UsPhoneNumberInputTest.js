import UsPhoneNumberInput from '@cdo/apps/code-studio/pd/form_components/UsPhoneNumberInput';
import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe("UsPhoneNumberInput", () => {
  it("Displays initial value properly formatted", () => {
    const usPhoneNumberInput = shallow(
      <UsPhoneNumberInput
        name="phone"
        label="label"
        value="1234567890"
      />
    );

    expect(usPhoneNumberInput.state("value")).to.eql("(123) 456-7890");
  });

  describe("With phone number", () => {
    let usPhoneNumberInput;
    let underlyingFieldGroup;
    beforeEach(() => {
      usPhoneNumberInput = shallow(
        <UsPhoneNumberInput
          name="phone"
          label="label"
        />
      );

      underlyingFieldGroup = usPhoneNumberInput.find("FieldGroup");
      expect(underlyingFieldGroup).to.have.length(1);
    });

    const sendText = (text) => {
      for (let i=0; i<text.length; i++) {
        const newValue = [usPhoneNumberInput.state("value"), text[i]].join("");
        underlyingFieldGroup.simulate("change", {phone: newValue});
      }
    };

    it("Displays the formatted phone number", () => {
      sendText("1234567890");
      expect(usPhoneNumberInput.state("value")).to.eql("(123) 456-7890");
    });

    it("Ignores invalid characters", () => {
      sendText("xyz!!%$");
      expect(usPhoneNumberInput.state("value")).to.eql("");

      sendText("(xxx12yyy)");
      expect(usPhoneNumberInput.state("value")).to.eql("(12");

      sendText("3)xxx-4aaa5-()6");
      expect(usPhoneNumberInput.state("value")).to.eql("(123) 456");
    });

    it("Calls supplied onChange function with just the numbers", () => {
      const onChange = sinon.spy();
      usPhoneNumberInput.setProps({onChange});

      sendText("xxx(123");
      expect(onChange).inOrder.to.be.calledWith({phone: "1"});
      expect(onChange).subsequently.to.be.calledWith({phone: "12"});
      expect(onChange).subsequently.to.be.calledWith({phone: "123"});
    });
  });

  describe("isValid()", () => {
    it("Returns true for 10 digit numbers", () => {
      const phoneNumber = "1234567890";
      expect(UsPhoneNumberInput.isValid(phoneNumber)).to.be.true;
    });

    it("Returns false for strings that are not 10 digit numbers", () => {
      [
        null,
        "",
        "x",
        "1234567890x",
        "123-456-7890"
      ].forEach(nonPhoneNumber => {
        const failMessage = `Expected isValid to be false for: ${nonPhoneNumber}`;
        expect(UsPhoneNumberInput.isValid(nonPhoneNumber), failMessage).to.be.false;
      });
    });
  });

  describe("toJustNumbers()", () => {
    it("Returns only digits from the input string", () => {
      // List of test tuples: input, expected result
      [
        [null, ""],
        ["", ""],
        ["abc", ""],
        ["123", "123"],
        ["a1b2c3d", "123"],
        ["   123-@~! ", "123"]
      ].forEach(testCase => {
        const [input, expectedResult] = testCase;
        const failMessage = `Expected toJustNumbers to return "${expectedResult}" for: "${input}"`;
        expect(UsPhoneNumberInput.toJustNumbers(input), failMessage).to.eql(expectedResult);
      });
    });
  });

  describe("coercePhoneNumber()", () => {
    it("Returns correctly formatted phone number string", () => {
      // List of test tuples: input, expected result
      [
        [null, ""],
        ["", ""],
        ["(", "("],
        ["(1", "(1"],
        ["(1)", "(1"],
        ["1", "(1"],
        ["x", ""],
        ["(123", "(123"],
        ["(123x", "(123"],
        ["(123)", "(123)"],
        ["(123)x", "(123)"],
        ["(1234", "(123) 4"],
        ["(123) 4x", "(123) 4"],
        ["(123) 456", "(123) 456"],
        ["(123) 456x", "(123) 456"],
        ["(123) 456-", "(123) 456-"],
        ["(123) 4567", "(123) 456-7"],
        ["(123) 456-7x", "(123) 456-7"],
        ["(123) 456-7890", "(123) 456-7890"],
        ["(123) 456-7890x", "(123) 456-7890"]
      ].forEach(testCase => {
        const [input, expectedResult] = testCase;
        const failMessage = `Expected coercePhoneNubmer to return "${expectedResult}" for: "${input}"`;
        expect(UsPhoneNumberInput.coercePhoneNumber(input), failMessage).to.eql(expectedResult);
      });
    });
  });
});
