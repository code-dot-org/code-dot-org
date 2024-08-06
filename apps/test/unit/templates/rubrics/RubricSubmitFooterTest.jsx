// react testing library import
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import * as teacherFeedbackDataApi from '@cdo/apps/templates/instructions/teacherFeedback/teacherFeedbackDataApi';
import * as topInstructionDataApi from '@cdo/apps/templates/instructions/topInstructionsDataApi';
import RubricSubmitFooter from '@cdo/apps/templates/rubrics/RubricSubmitFooter';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('RubricSubmitFooter', () => {
  let store;
  let postStub;
  let crsfToken;
  let timestamp;
  let updateTeacherFeedbackStub;
  let getTeacherFeedbackForStudentStub;

  async function wait() {
    for (let _ = 0; _ < 10; _++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  // Stubs updateTeacherFeedback() to call the fail callback only.
  function stubFailedUpdateTeacherFeedback() {
    updateTeacherFeedbackStub.returns({
      done: _ => {
        return {fail: cb => cb()};
      },
    });
  }

  // Stubs updateTeacherFeedback() to call the done callback only.
  function stubSuccessfulUpdateTeacherFeedback() {
    updateTeacherFeedbackStub.returns({
      done: cb => {
        cb();
        return {fail: _ => {}};
      },
    });
  }

  // Stubs HttpClient.post() to throw an error in order to run the catch block
  function stubFailedSubmitEvaluations() {
    postStub
      .withArgs(
        sinon.match(/\/rubrics\/\d+\/submit_evaluations$/),
        sinon.match.any,
        true,
        sinon.match.any
      )
      .rejects();
  }

  // Stubs HttpClient.post() to respond with some incorrect response body
  function stubInvalidResponseFromSubmitEvaluations() {
    postStub
      .withArgs(
        sinon.match(/\/rubrics\/\d+\/submit_evaluations$/),
        sinon.match.any,
        true,
        sinon.match.any
      )
      .returns(
        new Promise(resolve => {
          resolve({
            json: () =>
              Promise.resolve({
                someOtherStuff: 42,
              }),
          });
        })
      );
  }

  // Stubs HttpClient.post() to respond with the expected response body
  function stubSuccessfulSubmitEvaluations() {
    postStub
      .withArgs(
        sinon.match(/\/rubrics\/\d+\/submit_evaluations$/),
        sinon.match.any,
        true,
        sinon.match.any
      )
      .returns(
        new Promise(resolve => {
          resolve({
            json: () =>
              Promise.resolve({
                submittedAt: timestamp,
              }),
          });
        })
      );
  }

  // Stubs getTeacherFeedbackForStudent to respond successfully as expected
  function stubGetTeacherFeedbackForStudent(
    studentId,
    levelId,
    scriptId,
    data
  ) {
    const request = sinon.stub();
    request.getResponseHeader = sinon
      .stub()
      .withArgs('crsf-token')
      .returns(crsfToken);
    getTeacherFeedbackForStudentStub
      .withArgs(studentId, levelId, scriptId)
      .returns({
        done: cb => {
          new Promise(resolve => {
            resolve([data, null, request]);
          }).then(([a, b, c]) => {
            cb(a, b, c);
          });
        },
      });
  }

  beforeEach(() => {
    // Stub out the updateTeacherFeedback function
    updateTeacherFeedbackStub = sinon.stub(
      teacherFeedbackDataApi,
      'updateTeacherFeedback'
    );
    updateTeacherFeedbackStub.returns({});

    // Stub out the getTeacherFeedbackForStudent and return a crsf token
    crsfToken = 'some-crsf-token';
    getTeacherFeedbackForStudentStub = sinon.stub(
      topInstructionDataApi,
      'getTeacherFeedbackForStudent'
    );
    getTeacherFeedbackForStudentStub.returns({});

    // Stub out the submit with timestamp
    timestamp = '2024-03-10';
    postStub = sinon.stub(HttpClient, 'post');
    postStub.returns({});

    // Stub redux
    stubRedux();
    registerReducers({currentUser});
    store = getStore();
  });

  afterEach(() => {
    // Restore all stubs
    restoreRedux();
    postStub.restore();
    getTeacherFeedbackForStudentStub.restore();
    updateTeacherFeedbackStub.restore();
  });

  const defaultRubric = {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: 'goal 1',
        aiEnabled: false,
        evidenceLevels: [],
      },
      {
        id: 2,
        key: '2',
        learningGoal: 'goal 2',
        aiEnabled: true,
        evidenceLevels: [],
      },
    ],
    script: {
      id: 42,
    },
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      id: 107,
      name: 'test_level',
      position: 7,
    },
  };

  const defaultStudentInfo = {user_id: 1, name: 'Jane Doe'};

  it('gets the prior teacher feedback and remembers csrf-token', async () => {
    const priorTimestamp = '2024-02-09';
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      [{review_state: '', created_at: priorTimestamp}]
    );
    stubSuccessfulUpdateTeacherFeedback();
    stubSuccessfulSubmitEvaluations();

    const user = userEvent.setup();

    const {container} = render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // See that the submit button and keep working checkbox is disabled
    const checkbox = screen.getByLabelText(i18n.aiSubmitShouldKeepWorking());
    expect(checkbox).to.be.disabled;
    const button = screen.getByRole('button', {name: i18n.submitToStudent()});
    expect(button).to.be.disabled;

    // Wait until feedback is retrieved successfully
    await wait();

    // See that the submit button and keep-working checkbox are enabled
    expect(checkbox).to.not.be.disabled;
    expect(button).to.not.be.disabled;

    // Assert that 'feedback submitted' appears with the old timestamp
    const priorDate = new Date(priorTimestamp);
    const priorCheck = priorDate.toLocaleString();
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.contain(priorCheck);

    // Press submit, wait until things resolve, and see the crsf-token from the initial request
    await user.click(button);
    sinon.assert.calledWith(
      updateTeacherFeedbackStub,
      sinon.match.any,
      crsfToken
    );

    // Assert that the post was also called
    sinon.assert.called(postStub);

    // Assert that 'feedback submitted' appears
    const lastSubmittedDateObj = new Date(timestamp);
    const check = lastSubmittedDateObj.toLocaleString();
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.contain(check);
  });

  it('gracefully handles no prior teacher feedback and still sets csrf-token', async () => {
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      []
    );
    stubSuccessfulUpdateTeacherFeedback();
    stubSuccessfulSubmitEvaluations();
    const user = userEvent.setup();

    const {container} = render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // See that the submit button and keep working checkbox is disabled
    const checkbox = screen.getByLabelText(i18n.aiSubmitShouldKeepWorking());
    expect(checkbox).to.be.disabled;
    const button = screen.getByRole('button', {name: i18n.submitToStudent()});
    expect(button).to.be.disabled;

    // There's no prior timestamp
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.equal('');

    // Wait until feedback is retrieved successfully
    await wait();

    // See that the submit button and keep-working checkbox are enabled
    expect(checkbox).to.not.be.disabled;
    expect(button).to.not.be.disabled;

    // Press submit, wait until things resolve, and see the crsf-token from the initial request
    await user.click(button);
    sinon.assert.calledWith(
      updateTeacherFeedbackStub,
      sinon.match.any,
      crsfToken
    );
    sinon.assert.called(postStub);
  });

  it('sets keepWorking when previously set in teacher feedback', async () => {
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      [{review_state: 'keepWorking'}]
    );

    render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // See that the keep-working checkbox is not checked at first
    const checkbox = screen.getByLabelText(i18n.aiSubmitShouldKeepWorking());
    expect(checkbox).to.not.be.checked;

    // Wait until feedback is retrieved successfully
    await wait();

    // See that the keep-working checkbox is then checked to reflect the progress state
    expect(checkbox).to.be.checked;
  });

  it('handles successful submit button click by not displaying any error text', async () => {
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      []
    );
    stubSuccessfulUpdateTeacherFeedback();
    stubSuccessfulSubmitEvaluations();
    const user = userEvent.setup();

    const {container} = render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // There's no prior timestamp
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.equal('');

    // Wait until feedback is retrieved successfully
    await wait();

    // Press submit, wait until things resolve, and see the crsf-token from the initial request
    const button = screen.getByRole('button', {name: i18n.submitToStudent()});
    await user.click(button);
    sinon.assert.calledWith(
      updateTeacherFeedbackStub,
      sinon.match.any,
      crsfToken
    );
    sinon.assert.called(postStub);

    // Assert that the feedback error is NOT there
    expect(container.querySelector('#ui-feedback-submitted-error')).to.be.null;
  });

  it('handles error updating feedback on submit button click', async () => {
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      []
    );
    stubFailedUpdateTeacherFeedback();
    const user = userEvent.setup();

    const {container} = render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // There's no prior timestamp
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.equal('');

    // Wait until feedback is retrieved successfully
    await wait();

    // Press submit
    const button = screen.getByRole('button', {name: i18n.submitToStudent()});
    await user.click(button);

    // Assert that the feedback error appears
    expect(
      container.querySelector('#ui-feedback-submitted-error').textContent
    ).to.contain(i18n.errorSubmittingFeedback());
  });

  it('handles error submitting evaluations on submit button click', async () => {
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      []
    );
    stubSuccessfulUpdateTeacherFeedback();
    stubFailedSubmitEvaluations();
    const user = userEvent.setup();

    const {container} = render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // There's no prior timestamp
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.equal('');

    // Wait until feedback is retrieved successfully
    await wait();

    // Press submit
    const button = screen.getByRole('button', {name: i18n.submitToStudent()});
    await user.click(button);

    // Assert that the feedback error appears
    expect(
      container.querySelector('#ui-feedback-submitted-error').textContent
    ).to.contain(i18n.errorSubmittingFeedback());
  });

  it('handles error when submitting evaluations returns an invalid response on submit button click', async () => {
    stubGetTeacherFeedbackForStudent(
      defaultStudentInfo.user_id,
      defaultRubric.level.id,
      defaultRubric.script.id,
      []
    );
    stubSuccessfulUpdateTeacherFeedback();
    stubInvalidResponseFromSubmitEvaluations();
    const user = userEvent.setup();

    const {container} = render(
      <Provider store={store}>
        <RubricSubmitFooter
          rubric={defaultRubric}
          reportingData={{}}
          studentLevelInfo={defaultStudentInfo}
          open
        />
      </Provider>
    );

    // There's no prior timestamp
    expect(
      container.querySelector('#ui-feedback-submitted-timestamp').textContent
    ).to.equal('');

    // Wait until feedback is retrieved successfully
    await wait();

    // Press submit
    const button = screen.getByRole('button', {name: i18n.submitToStudent()});
    await user.click(button);

    // Assert that the feedback error appears
    expect(
      container.querySelector('#ui-feedback-submitted-error').textContent
    ).to.contain(i18n.errorSubmittingFeedback());
  });
});
