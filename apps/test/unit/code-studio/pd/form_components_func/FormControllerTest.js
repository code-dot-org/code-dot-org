import FormController from '@cdo/apps/code-studio/pd/form_components_func/FormController';
import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';

let DummyPage1 = () => {
  return <div>Page 1</div>;
};
DummyPage1.associatedFields = [];

let DummyPage2 = () => {
  return <div>Page 2</div>;
};
DummyPage2.associatedFields = [];

let DummyPage3 = () => {
  return <div>Page 3</div>;
};
DummyPage3.associatedFields = [];

describe('FormController', () => {
  describe('Standard usage', () => {
    let form;
    let onSuccessfulSubmit = sinon.stub();
    let defaultProps = {
      apiEndpoint: 'fake endpoint',
      options: {},
      requiredFields: [],
      pageComponents: [DummyPage1, DummyPage2, DummyPage3],
      onSuccessfulSubmit
    };
    afterEach(() => {
      sinon.restore();
      DummyPage1 = () => {
        return <div>Page 1</div>;
      };
      DummyPage1.associatedFields = [];

      DummyPage2 = () => {
        return <div>Page 2</div>;
      };
      DummyPage2.associatedFields = [];

      DummyPage3 = () => {
        return <div>Page 3</div>;
      };
      DummyPage3.associatedFields = [];

      defaultProps = {
        apiEndpoint: 'fake endpoint',
        options: {},
        requiredFields: [],
        pageComponents: [DummyPage1, DummyPage2, DummyPage3],
        onSuccessfulSubmit
      };
    });

    const getCurrentPage = () => form.find('Pagination').prop('activePage');
    const getData = page => form.find(page).prop('data');
    const getErrors = page => form.find(page).prop('errors');
    const setPage = i => {
      form.find('Pagination').prop('onSelect')(i + 1);
      form.update();
    };

    it('Initially renders the first page', () => {
      form = mount(<FormController {...defaultProps} />);
      expect(getCurrentPage()).to.equal(1);
      expect(form.find(DummyPage1)).to.have.length(1);
      expect(form.find(DummyPage2)).to.have.length(0);
      expect(form.find(DummyPage3)).to.have.length(0);
    });

    it('Displays page buttons on each page', () => {
      form = mount(<FormController {...defaultProps} />);
      const validatePageButtons = () => {
        const pageButtons = form.find('Pagination PaginationButton');
        expect(pageButtons).to.have.length(3);
        expect(pageButtons.map(button => button.text())).to.eql([
          '1',
          '2',
          '3'
        ]);
      };

      for (let i = 0; i < 3; i++) {
        setPage(i);
        validatePageButtons();
      }
    });

    it('Has a next button on the first page', () => {
      form = mount(<FormController {...defaultProps} />);
      const nextButton = form.find('button');
      expect(nextButton).to.have.length(1);
      expect(nextButton.text()).to.eql('Next');
    });

    it('Has back and next buttons on middle pages', () => {
      form = mount(
        <FormController {...defaultProps} validateOnSubmitOnly={true} />
      );
      setPage(1);
      const buttons = form.find('button');
      expect(buttons).to.have.length(2);
      expect(buttons.map(button => button.text())).to.eql(['Back', 'Next']);
    });

    it('Has a back and submit button on the last page', () => {
      form = mount(
        <FormController {...defaultProps} validateOnSubmitOnly={true} />
      );
      setPage(2);
      const buttons = form.find('button');
      expect(buttons).to.have.length(2);
      expect(buttons.map(button => button.text())).to.eql(['Back', 'Submit']);
    });

    describe('Page validation', () => {
      it('Does not navigate when the current page has errors', () => {
        // create errors
        form = mount(
          <FormController {...defaultProps} requiredFields={['field1']} />
        );
        DummyPage1.associatedFields = ['field1'];
        setPage(1);

        expect(getErrors(DummyPage1)).to.not.be.empty;
        expect(getCurrentPage()).to.equal(1);
      });

      it('Navigates when the current page has no errors', () => {
        // create valid
        form = mount(<FormController {...defaultProps} />);
        setPage(1);

        expect(getErrors(DummyPage2)).to.be.empty;
        expect(getCurrentPage()).to.equal(2);
      });

      describe('Submitting', () => {
        let server;

        const submitButton = () => form.find('#submit').first();

        const setupValid = () => {
          form = mount(<FormController {...defaultProps} />);
          setPage(2);
        };
        const setupErrored = () => {
          form = mount(
            <FormController {...defaultProps} requiredFields={['field1']} />
          );
          DummyPage3.associatedFields = ['field1'];
          setPage(2);
        };

        beforeEach(() => {
          server = sinon.fakeServer.create();
        });
        afterEach(() => {
          server.restore();
        });

        it('Does not submit when the last page has errors', () => {
          setupErrored();

          submitButton().simulate('submit');
          form.update();

          expect(getErrors(DummyPage3)).to.not.be.empty;
          expect(server.requests).to.be.empty;
        });

        it('Submits when the last page has no errors', () => {
          setupValid();

          submitButton().simulate('submit');
          form.update();

          expect(getErrors(DummyPage3)).to.be.empty;
          expect(server.requests).to.have.length(1);
          expect(server.requests[0].url).to.eql('fake endpoint');
        });

        it('Disables the submit button during submit', () => {
          setupValid();
          submitButton().simulate('submit');
          form.update();
          expect(submitButton().prop('disabled')).to.be.true;
        });

        it('Re-enables the submit button on error', () => {
          setupValid();
          server.respondWith([
            400,
            {'Content-Type': 'application/json'},
            JSON.stringify({
              errors: {form_data: ['an error']}
            })
          ]);

          submitButton().simulate('submit');
          server.respond();
          form.update();

          expect(getErrors(DummyPage3)).to.eql(['an error']);
          expect(submitButton().prop('disabled')).to.be.false;
        });

        it('Keeps the submit button disabled and calls onSuccessfulSubmit on success', () => {
          setupValid();
          server.respondWith([
            200,
            {'Content-Type': 'application/json'},
            JSON.stringify({})
          ]);

          submitButton().simulate('submit');
          server.respond();
          form.update();

          expect(submitButton().prop('disabled')).to.be.true;
          expect(onSuccessfulSubmit).to.be.calledOnce;
        });
      });
    });

    describe('validateCurrentPageRequiredFields()', () => {
      it('Generates errors for missing required fields on the current page', () => {
        // No data provided, so all required fields are missing
        form = mount(
          <FormController
            {...defaultProps}
            requiredFields={['included', 'excluded']}
          />
        );
        DummyPage1.associatedFields = ['included'];

        setPage(1);

        expect(getErrors(DummyPage1)).to.eql(['included']);
      });

      it('Strips string values on current page and sets empty ones to null', () => {
        const initialData = {
          textFieldWithSpace: '   trim   ',
          textFieldWithNoSpace: 'nothing to trim',
          arrayField: ['  no trim in array  '],
          onlySpaces: '     ',
          otherPageTextFieldWithSpace: '   no trim   ',
          otherPageArrayField: ['  still no trim in array  ']
        };
        form = mount(
          <FormController
            {...defaultProps}
            getInitialData={() => initialData}
          />
        );
        DummyPage1.associatedFields = [
          'textFieldWithSpace',
          'textFieldWithNoSpace',
          'arrayField',
          'onlySpaces'
        ];

        setPage(1);

        expect(getData(DummyPage2)).to.deep.eql({
          textFieldWithSpace: 'trim',
          textFieldWithNoSpace: 'nothing to trim',
          arrayField: ['  no trim in array  '],
          onlySpaces: null,
          otherPageTextFieldWithSpace: '   no trim   ',
          otherPageArrayField: ['  still no trim in array  ']
        });
      });

      it('Calls processPageData for the current page', () => {
        const pageData = {
          page1Field1: 'value1',
          page1Field2: 'will be cleared',
          page1Field3: 'will be modified'
        };

        DummyPage1.processPageData = sinon
          .stub()
          .withArgs(pageData)
          .returns({
            page1Field2: undefined,
            page1Field3: 'modified'
          });

        DummyPage1.associatedFields = [
          'page1Field1',
          'page1Field2',
          'page1Field3'
        ];

        const initialData = {
          ...pageData,
          page2Field1: 'unmodified'
        };
        form = mount(
          <FormController
            {...defaultProps}
            getInitialData={() => initialData}
          />
        );

        setPage(1);

        expect(DummyPage1.processPageData).to.be.calledOnce;
        expect(getData(DummyPage2)).to.deep.eql({
          page1Field1: 'value1',
          page1Field2: undefined,
          page1Field3: 'modified',
          page2Field1: 'unmodified'
        });
      });
    });

    describe('With session storage', () => {
      const sessionStorageKey = 'DummyForm';
      afterEach(() => {
        sessionStorage.removeItem('DummyForm');
      });

      it('Saves form data to session storage', () => {
        const initialData = {
          existingField1: 'existing value 1'
        };
        form = mount(
          <FormController
            {...defaultProps}
            sessionStorageKey={sessionStorageKey}
            getInitialData={() => initialData}
          />
        );
        form.find(DummyPage1).prop('onChange')({
          updatedField1: 'updated value 1'
        });
        expect(sessionStorage[sessionStorageKey]).to.eql(
          JSON.stringify({
            currentPage: 0,
            data: {
              existingField1: 'existing value 1',
              updatedField1: 'updated value 1'
            }
          })
        );
      });

      it('Saves current page to session storage', () => {
        const initialData = {
          existingField1: 'existing value 1'
        };
        form = mount(
          <FormController
            {...defaultProps}
            sessionStorageKey={sessionStorageKey}
            getInitialData={() => initialData}
          />
        );
        setPage(1);
        expect(sessionStorage['DummyForm']).to.eql(
          JSON.stringify({
            currentPage: 1,
            data: {existingField1: 'existing value 1'}
          })
        );
      });

      it('Loads current page and form data from session storage on mount', () => {
        const testData = {
          field1: 'value 1',
          field2: 'value 2'
        };
        sessionStorage['DummyForm'] = JSON.stringify({
          currentPage: 2,
          data: testData
        });

        form = mount(
          <FormController
            {...defaultProps}
            sessionStorageKey={sessionStorageKey}
            onSuccessfulSubmit={onSuccessfulSubmit}
          />
        );
        expect(getCurrentPage()).to.equal(3);
        expect(getData(DummyPage3)).to.eql(testData);
      });
    });
  });
});
