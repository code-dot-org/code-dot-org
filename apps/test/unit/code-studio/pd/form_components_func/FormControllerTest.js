import {isolateComponent} from 'isolate-react';
import $ from 'jquery';
import React from 'react';

import {PROGRAM_CSD} from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplicationConstants';
import FormController from '@cdo/apps/code-studio/pd/form_components_func/FormController';



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
  let form;
  let onSuccessfulSubmit = jest.fn();
  const fakeEndpoint = '/fake/endpoint';
  let defaultProps = {
    apiEndpoint: fakeEndpoint,
    options: {},
    requiredFields: [],
    pageComponents: [DummyPage1, DummyPage2, DummyPage3],
    onSuccessfulSubmit,
    allowPartialSaving: true,
  };
  afterEach(() => {
    jest.restoreAllMocks();

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
      apiEndpoint: fakeEndpoint,
      options: {},
      requiredFields: [],
      pageComponents: [DummyPage1, DummyPage2, DummyPage3],
      onSuccessfulSubmit,
      allowPartialSaving: true,
    };
  });

  const saveButtonText = 'Save and Return Later';
  const appAlreadyExistsErrorText =
    'We found an application that you already started. Reload the page to continue.';
  const applicationId = 7;
  const getCurrentPage = () => form.findOne('Pagination').props.activePage;
  const getData = page => form.findOne(page).props.data;
  const getErrors = page => form.findOne(page).props.errors;
  const setPage = i => {
    form.findOne('Pagination').props.onSelect(i + 1);
  };
  const serverResponse = (statusNumber = 200, data = {}) => [
    statusNumber,
    {'Content-Type': 'application/json'},
    JSON.stringify(data),
  ];
  const clickSaveButton = () => form.findAll('Button')[1].props.onClick();

  it('Initially renders the first page', () => {
    form = isolateComponent(<FormController {...defaultProps} />);
    expect(getCurrentPage()).toBe(1);
    expect(form.exists(DummyPage1));
    expect(!form.exists(DummyPage2));
    expect(!form.exists(DummyPage3));
  });

  it('Displays correct number of page buttons on each page', () => {
    form = isolateComponent(<FormController {...defaultProps} />);
    const pagination = form.findOne('Pagination');
    expect(pagination.props.items).toBe(3);
  });

  it('Has a next button and a save button on the first page', () => {
    form = isolateComponent(<FormController {...defaultProps} />);
    const buttons = form.findAll('Button');
    expect(buttons).toHaveLength(2);
    expect(buttons.map(button => button.content())).toEqual([
      'Next',
      saveButtonText,
    ]);
  });

  it('Has back, next, and save buttons on middle page', () => {
    form = isolateComponent(
      <FormController {...defaultProps} validateOnSubmitOnly={true} />
    );
    setPage(1);
    const buttons = form.findAll('Button');
    expect(buttons).toHaveLength(3);
    expect(buttons.map(button => button.content())).toEqual([
      'Back',
      'Next',
      saveButtonText,
    ]);
  });

  it('Has back, submit, and save buttons on the last page', () => {
    form = isolateComponent(
      <FormController {...defaultProps} validateOnSubmitOnly={true} />
    );
    setPage(2);
    const buttons = form.findAll('Button');
    expect(buttons).toHaveLength(3);
    expect(buttons.map(button => button.content())).toEqual([
      'Back',
      'Submit',
      saveButtonText,
    ]);
  });

  it('Never shows save button if partial saving is not enabled', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        allowPartialSaving={false}
        validateOnSubmitOnly={true}
      />
    );
    [0, 1, 2].forEach(page => {
      setPage(page);
      const buttons = form.findAll('Button');
      buttons.forEach(button =>
        expect(button.content()).not.toEqual(saveButtonText)
      );
    });
  });

  it('Never shows save button if status is reopened', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        allowPartialSaving={true}
        validateOnSubmitOnly={true}
        savedStatus={'reopened'}
      />
    );
    [0, 1, 2].forEach(page => {
      setPage(page);
      const buttons = form.findAll('Button');
      buttons.forEach(button =>
        expect(button.content()).not.toEqual(saveButtonText)
      );
    });
  });

  it('Shows data was loaded message given application id, and user can close message', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        applicationId={applicationId}
        allowPartialSaving={true}
        validateOnSubmitOnly={true}
      />
    );
    const alert = form.findOne('Alert');
    expect(alert.content()).toContain(
      'We found an application you started! Your saved responses have been loaded.'
    );

    alert.props.onDismiss();
    expect(form.findAll('Alert')).toHaveLength(0);
  });

  it('Removes data was loaded message after first page', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        applicationId={applicationId}
        allowPartialSaving={true}
        validateOnSubmitOnly={true}
      />
    );
    expect(form.findOne('Alert')).toBeDefined();
    setPage(1);
    expect(form.findAll('Alert')).toHaveLength(0);
  });

  it('Shows reopened message if status is reopened, and user can close message', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        applicationId={applicationId}
        savedStatus={'reopened'}
        allowPartialSaving={true}
        validateOnSubmitOnly={true}
      />
    );
    const alert = form.findOne('Alert');
    expect(alert.content()).toContain(
      'Your Regional Partner has requested more information. Please update and resubmit.'
    );

    alert.props.onDismiss();
    expect(form.findAll('Alert')).toHaveLength(0);
  });

  it('Removes reopened message after first page', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        applicationId={applicationId}
        savedStatus={'reopened'}
        allowPartialSaving={true}
        validateOnSubmitOnly={true}
      />
    );
    expect(form.findOne('Alert')).toBeDefined();
    setPage(1);
    expect(form.findAll('Alert')).toHaveLength(0);
  });

  it('Does not show data was loaded message if there is no application id', () => {
    form = isolateComponent(
      <FormController
        {...defaultProps}
        allowPartialSaving={true}
        validateOnSubmitOnly={true}
      />
    );
    expect(form.findAll('Alert')).toHaveLength(0);
  });

  describe('Saving', () => {
    it('Sends isSaving on save', () => {
      jest.spyOn($, 'ajax').mockClear();
      form = isolateComponent(<FormController {...defaultProps} />);
      clickSaveButton();
      const serverCalledWith = $.ajax.mock.calls[0][0];
      expect(JSON.parse(serverCalledWith.data).isSaving).toBe(true);
    });

    it('Disables the save button during save and renders spinner', () => {
      form = isolateComponent(<FormController {...defaultProps} />);
      clickSaveButton();
      expect(form.findAll('Button')[1].props).to.be.disabled;
      expect(form.findAll('Spinner')).toHaveLength(1);
    });

    it('Re-enables the save button after successful save and removes spinner', () => {
      form = isolateComponent(<FormController {...defaultProps} />);

      const server = sinon.fakeServer.create();
      server.respondWith(serverResponse(201));

      clickSaveButton();
      server.respond();

      expect(form.findAll('Button')[1].props).to.be.disabled;
      expect(form.findAll('Spinner')).toHaveLength(0);

      server.mockRestore();
    });

    it('Shows apps closed message if RP has closed applications', async () => {
      jest.spyOn(window, 'fetch').mockClear().mockReturnValue(
        Promise.resolve({
          ok: true,
          json: () => {
            return {id: 1, pl_programs_offered: ['CSD'], are_apps_closed: true};
          },
        })
      );

      const initialData = {
        school: 'New School',
        program: PROGRAM_CSD,
      };
      jest.useFakeTimers();
      form = isolateComponent(
        <FormController {...defaultProps} getInitialData={() => initialData} />
      );
      await clock.runAllAsync();

      const alerts = form.findAll('Alert');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].content()).toContain('Applications are closed for this region');
      jest.useRealTimers();
    });

    it('hides apps closed message if selecting a different RP with applications open', async () => {
      const stub = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
      stub.mockImplementation(() => {
        if (stub.mock.calls.length === 0) {
          return Promise.resolve({
            ok: true,
            json: () => {
              return {id: 1, pl_programs_offered: ['CSD'], are_apps_closed: true};
            },
          });
        }
      });
      stub.mockImplementation(() => {
        if (stub.mock.calls.length === 1) {
          return Promise.resolve({
            ok: true,
            json: () => {
              return {
                id: 2,
                pl_programs_offered: ['CSD'],
                are_apps_closed: false,
              };
            },
          });
        }
      });

      const initialData = {
        school: 'New School',
        program: PROGRAM_CSD,
      };
      jest.useFakeTimers();
      form = isolateComponent(
        <FormController {...defaultProps} getInitialData={() => initialData} />
      );
      await clock.runAllAsync();

      const alerts = form.findAll('Alert');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].content()).toContain('Applications are closed for this region');

      const page = form.findOne('DummyPage1');
      page.props.onChange({school: 'Updated school'});
      await clock.runAllAsync();

      expect(form.findAll('Alert')).toHaveLength(0);

      jest.useRealTimers();
    });

    it('Shows error message if user tries to save an application that already exists', () => {
      form = isolateComponent(<FormController {...defaultProps} />);

      const server = sinon.fakeServer.create();
      server.respondWith(serverResponse(409));

      form.findAll('Button')[1].props.onClick();
      server.respond();

      const alerts = form.findAll('Alert');
      expect(alerts).toHaveLength(2);
      expect(alerts[0].content()).toContain(appAlreadyExistsErrorText);

      server.mockRestore();
    });

    [
      serverResponse(400, {
        errors: {form_data: ['an error']},
      }),
      serverResponse(500),
      serverResponse(409),
    ].forEach(response => {
      const statusNumber = response[0];
      it(`Re-enables the save button after unsuccessful save with ${statusNumber} error`, () => {
        form = isolateComponent(<FormController {...defaultProps} />);

        const server = sinon.fakeServer.create();
        server.respondWith(
          serverResponse(400, {
            errors: {form_data: ['an error']},
          })
        );

        clickSaveButton();
        server.respond();

        expect(form.findAll('Button')[1].props).to.be.disabled;

        server.mockRestore();
      });
    });

    it('Shows saved message alert after saving is complete, and user can close it', () => {
      form = isolateComponent(
        <FormController {...defaultProps} applicationId={applicationId} />
      );

      const server = sinon.fakeServer.create();
      server.respondWith(serverResponse(201));

      clickSaveButton();
      server.respond();

      form.findAll('Button')[1].props.onClick();
      server.respond();

      const alert = form.findOne('Alert');
      expect(alert.content()).toContain(
        'Your progress has been saved. Return to this page at any time to continue working on your application.'
      );

      alert.props.onDismiss();
      expect(form.findAll('Alert')).toHaveLength(0);

      expect(form.findAll('Button')[1].props).to.be.disabled;

      server.mockRestore();
    });

    it('Saved message alert disappears after changing pages', () => {
      form = isolateComponent(
        <FormController {...defaultProps} applicationId={applicationId} />
      );

      const server = sinon.fakeServer.create();
      server.respondWith([
        201,
        {'Content-Type': 'application/json'},
        JSON.stringify({}),
      ]);

      clickSaveButton(form);
      server.respond();

      expect(form.findOne('Alert')).toBeDefined();
      setPage(1);
      expect(form.findAll('Alert')).toHaveLength(0);

      server.mockRestore();
    });
  });

  describe('Page validation', () => {
    it('Does not navigate when the current page has errors', () => {
      // create errors
      form = isolateComponent(
        <FormController {...defaultProps} requiredFields={['field1']} />
      );
      DummyPage1.associatedFields = ['field1'];
      setPage(1);

      expect(getErrors(DummyPage1)).not.toHaveLength(0);
      expect(getCurrentPage()).toBe(1);
    });

    it('Navigates when the current page has no errors', () => {
      // create valid
      form = isolateComponent(<FormController {...defaultProps} />);
      setPage(1);

      expect(getErrors(DummyPage2)).toHaveLength(0);
      expect(getCurrentPage()).toBe(2);
    });

    describe('Submitting', () => {
      const triggerSubmit = () =>
        form.findOne('form').props.onSubmit({preventDefault: jest.fn()});

      const setupValid = (applicationId = undefined) => {
        form = isolateComponent(
          <FormController {...defaultProps} applicationId={applicationId} />
        );
        setPage(2);
      };

      const setUpValidWithApplicationId = applicationId =>
        setupValid(applicationId);

      const setupErrored = (applicationId = undefined) => {
        form = isolateComponent(
          <FormController {...defaultProps} requiredFields={['field1']} />
        );
        DummyPage3.associatedFields = ['field1'];
        setPage(2);
      };

      let server;
      beforeEach(() => {
        server = sinon.fakeServer.create();
      });
      afterEach(() => {
        server.mockRestore();
      });

      it('Does not submit when the last page has errors', () => {
        setupErrored();

        triggerSubmit();

        expect(getErrors(DummyPage3)).not.toHaveLength(0);
        expect(server.requests).toHaveLength(0);
      });

      [
        {previouslySaved: false, message: 'with new application'},
        {previouslySaved: true, message: 'with previously-saved application'},
      ].forEach(({previouslySaved, message}) => {
        it(`Submits when the last page has no errors ${message}`, () => {
          previouslySaved
            ? setUpValidWithApplicationId(applicationId)
            : setupValid();

          triggerSubmit();

          expect(getErrors(DummyPage3)).toHaveLength(0);
          expect(server.requests).toHaveLength(1);
          expect(server.requests[0].method).toEqual(previouslySaved ? 'PUT' : 'POST');
          expect(server.requests[0].url).toEqual(previouslySaved ? `${fakeEndpoint}/${applicationId}` : fakeEndpoint);
        });
      });

      it('Disables the submit button during submit and renders spinner', () => {
        setupValid();
        triggerSubmit();
        expect(form.findOne('#submit').props).to.be.disabled;
        expect(form.findAll('Spinner')).toHaveLength(1);
      });

      it('Shows error message if user tries to submit an application that already exists', () => {
        setupValid();
        server.respondWith(serverResponse(409));

        triggerSubmit();
        server.respond();

        const alerts = form.findAll('Alert');
        expect(alerts).toHaveLength(2);
        expect(alerts[0].content()).toContain(appAlreadyExistsErrorText);
      });

      [
        serverResponse(400, {
          errors: {form_data: ['an error']},
        }),
        serverResponse(500),
        serverResponse(409),
      ].forEach(response => {
        const statusNumber = response[0];
        it(`Re-enables the submit button on ${statusNumber} error and removes spinner`, () => {
          setupValid();
          server.respondWith(response);

          triggerSubmit();
          server.respond();

          statusNumber === 400 &&
            expect(getErrors(DummyPage3)).toEqual(['an error']);
          expect(form.findOne('#submit').props).to.be.disabled;
          expect(form.findAll('Spinner')).toHaveLength(0);
        });
      });

      it('Sends isSaving as false on submit', () => {
        jest.spyOn($, 'ajax').mockClear();
        form = isolateComponent(<FormController {...defaultProps} />);
        setPage(2);
        triggerSubmit();
        const serverCalledWith = $.ajax.mock.calls[0][0];
        expect(JSON.parse(serverCalledWith.data).isSaving).toBe(false);
      });

      it('Keeps the submit button disabled and calls onSuccessfulSubmit on success', () => {
        setupValid();
        server.respondWith(serverResponse(200));

        triggerSubmit();
        server.respond();

        expect(form.findOne('#submit').props).to.be.disabled;
        expect(onSuccessfulSubmit).toHaveBeenCalledTimes(1);
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

      expect(getErrors(DummyPage1)).toEqual(['included']);
    });

    it('Strips string values on current page and sets empty ones to null', () => {
      const initialData = {
        textFieldWithSpace: '   trim   ',
        textFieldWithNoSpace: 'nothing to trim',
        arrayField: ['  no trim in array  '],
        onlySpaces: '     ',
        otherPageTextFieldWithSpace: '   no trim   ',
        otherPageArrayField: ['  still no trim in array  '],
      };
      form = isolateComponent(
        <FormController {...defaultProps} getInitialData={() => initialData} />
      );
      DummyPage1.associatedFields = [
        'textFieldWithSpace',
        'textFieldWithNoSpace',
        'arrayField',
        'onlySpaces',
      ];

      setPage(1);

      expect(getData(DummyPage2)).toEqual({
        textFieldWithSpace: 'trim',
        textFieldWithNoSpace: 'nothing to trim',
        arrayField: ['  no trim in array  '],
        onlySpaces: null,
        otherPageTextFieldWithSpace: '   no trim   ',
        otherPageArrayField: ['  still no trim in array  '],
      });
    });

    it('Calls processPageData for the current page', () => {
      const pageData = {
        page1Field1: 'value1',
        page1Field2: 'will be cleared',
        page1Field3: 'will be modified',
      };

      DummyPage1.processPageData = jest.fn().mockImplementation((...args) => {
        if (args[0] === pageData) {
          return {
            page1Field2: undefined,
            page1Field3: 'modified',
          };
        }
      });

      DummyPage1.associatedFields = [
        'page1Field1',
        'page1Field2',
        'page1Field3',
      ];

      const initialData = {
        ...pageData,
        page2Field1: 'unmodified',
      };
      form = isolateComponent(
        <FormController {...defaultProps} getInitialData={() => initialData} />
      );

      setPage(1);

      expect(DummyPage1.processPageData).toHaveBeenCalledTimes(1);
      expect(getData(DummyPage2)).toEqual({
        page1Field1: 'value1',
        page1Field2: undefined,
        page1Field3: 'modified',
        page2Field1: 'unmodified',
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
        existingField1: 'existing value 1',
      };
      form = isolateComponent(
        <FormController
          {...defaultProps}
          sessionStorageKey={sessionStorageKey}
          getInitialData={() => initialData}
        />
      );
      form.findOne(DummyPage1).props.onChange({
        updatedField1: 'updated value 1',
      });
      expect(sessionStorage[sessionStorageKey]).toEqual(JSON.stringify({
        currentPage: 0,
        data: {
          existingField1: 'existing value 1',
          updatedField1: 'updated value 1',
        },
      }));
    });

    it('Saves current page to session storage', () => {
      const initialData = {
        existingField1: 'existing value 1',
      };
      form = isolateComponent(
        <FormController
          {...defaultProps}
          sessionStorageKey={sessionStorageKey}
          getInitialData={() => initialData}
        />
      );
      setPage(1);
      expect(sessionStorage['DummyForm']).toEqual(JSON.stringify({
        currentPage: 1,
        data: {existingField1: 'existing value 1'},
      }));
    });

    it('Loads current page and form data from session storage on mount', () => {
      const testData = {
        field1: 'value 1',
        field2: 'value 2',
      };
      sessionStorage['DummyForm'] = JSON.stringify({
        currentPage: 2,
        data: testData,
      });

      form = isolateComponent(
        <FormController
          {...defaultProps}
          sessionStorageKey={sessionStorageKey}
          onSuccessfulSubmit={onSuccessfulSubmit}
        />
      );
      expect(getCurrentPage()).toBe(3);
      expect(getData(DummyPage3)).toEqual(testData);
    });
  });
});
