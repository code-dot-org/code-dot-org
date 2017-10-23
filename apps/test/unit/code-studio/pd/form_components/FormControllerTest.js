import FormController from '@cdo/apps/code-studio/pd/form_components/FormController';
import FormComponent from '@cdo/apps/code-studio/pd/form_components/FormComponent';
import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';

describe("FormController", () => {
  it("Can not be instantiated directly", () => {
    const constructor = () => new FormController();
    expect(constructor).to.throw(TypeError, "FormController is an abstract class; cannot construct instances directly");
  });

  it("Requires getPageComponents", () => {
    class EmptyForm extends FormController {}
    expect(new EmptyForm().getPageComponents).to.throw(TypeError, "must override FormController.getPageComponents");
  });

  describe("Derived form with pages", () => {
    class DummyPage1 extends FormComponent {
      static associatedFields = [];
      render() {
        return <div>Page 1</div>;
      }
    }

    class DummyPage2 extends FormComponent {
      static associatedFields = [];
      render() {
        return <div>Page 2</div>;
      }
    }

    class DummyPage3 extends FormComponent {
      static associatedFields = [];
      render() {
        return <div>Page 3</div>;
      }
    }

    class DummyForm extends FormController {
      getPageComponents() {
        return [
          DummyPage1,
          DummyPage2,
          DummyPage3
        ];
      }
      onSuccessfulSubmit() {}
    }

    let form;
    beforeEach(() => {
      form = mount(
        <DummyForm
          apiEndpoint = "fake endpoint"
          options = {{}}
          requiredFields = {[]}
        />
      );
    });

    it("Initially renders the first page", () => {
      expect(form.state('currentPage')).to.equal(0);
      expect(form.find(DummyPage1)).to.have.length(1);
      expect(form.find(DummyPage2)).to.have.length(0);
      expect(form.find(DummyPage3)).to.have.length(0);
    });

    it("Displays page buttons on each page", () => {
      const validatePageButtons = () => {
        const pageButtons = form.find("Pagination PaginationButton");
        expect(pageButtons).to.have.length(3);
        expect(pageButtons.map(button => button.text())).to.eql(["1","2","3"]);
      };

      for (let i=0; i<3; i++) {
        form.setState({currentPage: i});
        validatePageButtons();
      }
    });

    it("Has a next button on the first page", () => {
      const nextButton = form.find("button");
      expect(nextButton).to.have.length(1);
      expect(nextButton.text()).to.eql("Next");
    });

    it("Has back and next buttons on middle pages", () => {
      form.setState({currentPage: 1});
      const buttons = form.find("button");
      expect(buttons).to.have.length(2);
      expect(buttons.map(button => button.text())).to.eql(["Back", "Next"]);
    });

    it("Has a back and submit button on the last page", () => {
      form.setState({currentPage: 2});
      const buttons = form.find("button");
      expect(buttons).to.have.length(2);
      expect(buttons.map(button => button.text())).to.eql(["Back", "Submit"]);
    });

    describe("Page validation", () => {
      let validateCurrentPageRequiredFields;
      beforeEach(() => {
        validateCurrentPageRequiredFields = sinon.stub(DummyForm.prototype, "validateCurrentPageRequiredFields");
      });
      afterEach(() => {
        validateCurrentPageRequiredFields.restore();
      });

      it("Does not navigate when the current page has errors", () => {
        validateCurrentPageRequiredFields.returns(false);
        const nextButton = form.find("button");
        nextButton.simulate("click");

        expect(validateCurrentPageRequiredFields).to.have.been.calledOnce;
        expect(form.state("currentPage")).to.equal(0);
      });

      it("Navigates when the current page has no errors", () => {
        validateCurrentPageRequiredFields.returns(true);
        const nextButton = form.find("button");
        nextButton.simulate("click");

        expect(validateCurrentPageRequiredFields).to.have.been.calledOnce;
        expect(form.state("currentPage")).to.equal(1);
      });

      describe("Submitting", () => {
        let server;
        let submitButton;
        beforeEach(() => {
          server = sinon.fakeServer.create();
          form.setState({currentPage: 2});
          submitButton = form.find("button").findWhere(button => button.text() === "Submit");
        });
        afterEach(() => {
          server.restore();
        });

        it("Does not submit when the last page has errors", () => {
          validateCurrentPageRequiredFields.returns(false);
          submitButton.simulate("submit");

          expect(validateCurrentPageRequiredFields).to.have.been.calledOnce;
          expect(server.requests).to.be.empty;
        });

        it("Submits when the last page has no errors", () => {
          validateCurrentPageRequiredFields.returns(true);
          submitButton.simulate("submit");

          expect(validateCurrentPageRequiredFields).to.have.been.calledOnce;
          expect(server.requests).to.have.length(1);
          expect(server.requests[0].url).to.eql("fake endpoint");
        });

        it("Disables the submit button during submit", () => {
          validateCurrentPageRequiredFields.returns(true);
          submitButton.simulate("submit");
          expect(form.state("submitting")).to.be.true;
          expect(submitButton).to.be.disabled();
        });

        it("Re-enables the submit button on error", () => {
          validateCurrentPageRequiredFields.returns(true);
          server.respondWith([400, { "Content-Type": "application/json" }, JSON.stringify({
            errors: {form_data: ["an error"]}
          })]);

          submitButton.simulate("submit");
          server.respond();
          expect(form.state("submitting")).to.be.false;
          expect(form.state("errors")).to.eql(["an error"]);
        });

        it("Keeps the submit button disabled and calls onSuccessfulSubmit on success", () => {
          validateCurrentPageRequiredFields.returns(true);
          server.respondWith([200, { "Content-Type": "application/json" }, JSON.stringify({})]);
          const onSuccessfulSubmit = sinon.stub(DummyForm.prototype, "onSuccessfulSubmit");

          submitButton.simulate("submit");
          server.respond();

          expect(form.state("submitting")).to.be.true;
          expect(submitButton).to.be.disabled();
          expect(onSuccessfulSubmit).to.be.calledOnce;
        });
      });
    });

    describe("validateCurrentPageRequiredFields()", () => {
      let render;
      before(() => {
        // Skip rendering
        render = sinon.stub(DummyForm.prototype, "render");
        render.returns(null);
      });
      after(() => {
        render.restore();
      });

      let getRequiredFields;
      let getCurrentPageComponent;
      let currentPageAssociatedFields = [];
      beforeEach(() => {
        getRequiredFields = sinon.stub(DummyForm.prototype, "getRequiredFields");
        getCurrentPageComponent = sinon.stub(DummyForm.prototype, "getCurrentPageComponent");
        getCurrentPageComponent.callsFake(() => ({associatedFields: currentPageAssociatedFields}));
      });
      afterEach(() => {
        getRequiredFields.restore();
        getCurrentPageComponent.restore();
      });

      it("Generates errors for missing required fields on the current page", () => {
        // No data provided, so all required fields are missing
        getRequiredFields.returns(["included", "excluded"]);
        currentPageAssociatedFields = ["included"];

        const validated = form.getNode().validateCurrentPageRequiredFields();
        expect(validated).to.be.false;
        expect(form.state("errors")).to.eql(["included"]);
      });

      it("Strips string values on current page and sets empty ones to null", () => {
        form.setState({data: {
          textFieldWithSpace: "   trim   ",
          textFieldWithNoSpace: "nothing to trim",
          arrayField: ["  no trim in array  "],
          onlySpaces: "     ",
          otherPageTextFieldWithSpace: "   no trim   ",
          otherPageArrayField: ["  still no trim in array  "]
        }});
        getRequiredFields.returns([]);
        currentPageAssociatedFields = [
          "textFieldWithSpace",
          "textFieldWithNoSpace",
          "arrayField",
          "onlySpaces"
        ];

        form.getNode().validateCurrentPageRequiredFields();
        expect(form.state("data")).to.deep.eql({
          textFieldWithSpace: "trim",
          textFieldWithNoSpace: "nothing to trim",
          arrayField: ["  no trim in array  "],
          onlySpaces: null,
          otherPageTextFieldWithSpace: "   no trim   ",
          otherPageArrayField: ["  still no trim in array  "]
        });
      });
    });
  });
});
