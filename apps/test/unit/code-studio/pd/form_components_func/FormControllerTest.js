import FormController from '@cdo/apps/code-studio/pd/form_components_func/FormController';
import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {isolateComponent} from 'isolate-components';

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

    const getCurrentPage = () => form.findOne('Pagination').props.activePage;
    const getData = page => form.findOne(page).props.data;
    const getErrors = page => form.findOne(page).props.errors;
    const setPage = i => {
      form.findOne('Pagination').props.onSelect(i + 1);
    };

    it('Initially renders the first page', () => {
      form = isolateComponent(<FormController {...defaultProps} />);
      expect(getCurrentPage()).to.equal(1);
      expect(form.exists(DummyPage1));
      expect(!form.exists(DummyPage2));
      expect(!form.exists(DummyPage3));
    });

    it('Displays correct number of page buttons on each page', () => {
      form = isolateComponent(<FormController {...defaultProps} />);
      const pagination = form.findOne('Pagination');
      expect(pagination.props.items).to.equal(3);
    });

    it('Has a next button on the first page', () => {
      form = isolateComponent(<FormController {...defaultProps} />);
      const nextButton = form.findOne('Button');
      expect(nextButton.content()).to.eql('Next');
    });

    it('Has back and next buttons on middle pages', () => {
      form = isolateComponent(
        <FormController {...defaultProps} validateOnSubmitOnly={true} />
      );
      setPage(1);
      const buttons = form.findAll('Button');
      expect(buttons).to.have.length(2);
      expect(buttons.map(button => button.content())).to.eql(['Back', 'Next']);
    });

    it('Has a back and submit button on the last page', () => {
      form = isolateComponent(
        <FormController {...defaultProps} validateOnSubmitOnly={true} />
      );
      setPage(2);
      const buttons = form.findAll('Button');
      expect(buttons).to.have.length(2);
      expect(buttons.map(button => button.content())).to.eql([
        'Back',
        'Submit'
      ]);
    });

    describe('Page validation', () => {
      it('Does not navigate when the current page has errors', () => {
        // create errors
        form = isolateComponent(
          <FormController {...defaultProps} requiredFields={['field1']} />
        );
        DummyPage1.associatedFields = ['field1'];
        setPage(1);

        expect(getErrors(DummyPage1)).to.not.be.empty;
        expect(getCurrentPage()).to.equal(1);
      });

      it('Navigates when the current page has no errors', () => {
        // create valid
        form = isolateComponent(<FormController {...defaultProps} />);
        setPage(1);

        expect(getErrors(DummyPage2)).to.be.empty;
        expect(getCurrentPage()).to.equal(2);
      });

      describe('Submitting', () => {
        let server;

        const triggerSubmit = () =>
          form.findOne('form').props.onSubmit(new window.SubmitEvent('submit'));

        const setupValid = () => {
          form = isolateComponent(<FormController {...defaultProps} />);
          setPage(2);
        };
        const setupErrored = () => {
          form = isolateComponent(
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

          triggerSubmit();

          expect(getErrors(DummyPage3)).to.not.be.empty;
          expect(server.requests).to.be.empty;
        });

        it('Submits when the last page has no errors', () => {
          setupValid();

          triggerSubmit();

          expect(getErrors(DummyPage3)).to.be.empty;
          expect(server.requests).to.have.length(1);
          expect(server.requests[0].url).to.eql('fake endpoint');
        });

        it('Disables the submit button during submit', () => {
          setupValid();
          triggerSubmit();
          expect(form.findOne('#submit').props.disabled).to.be.true;
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

          triggerSubmit();
          server.respond();

          expect(getErrors(DummyPage3)).to.eql(['an error']);
          expect(form.findOne('#submit').props.disabled).to.be.false;
        });

        it('Keeps the submit button disabled and calls onSuccessfulSubmit on success', () => {
          setupValid();
          server.respondWith([
            200,
            {'Content-Type': 'application/json'},
            JSON.stringify({})
          ]);

          triggerSubmit();
          server.respond();

          expect(form.findOne('#submit').props.disabled).to.be.true;
          expect(onSuccessfulSubmit).to.be.calledOnce;
        });
      });
    });

    describe('validateCurrentPageRequiredFields()', () => {
      it('Generates errors for missing required fields on the current page', () => {
        // No data provided, so all required fields are missing
        form = isolateComponent(
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
        form = isolateComponent(
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
        form = isolateComponent(
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
        form = isolateComponent(
          <FormController
            {...defaultProps}
            sessionStorageKey={sessionStorageKey}
            getInitialData={() => initialData}
          />
        );
        form.findOne(DummyPage1).props.onChange({
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
        form = isolateComponent(
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

        form = isolateComponent(
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
