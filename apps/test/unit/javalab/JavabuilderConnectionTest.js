import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import project from '@cdo/apps/code-studio/initApp/project';
import {
  WebSocketMessageType,
  StatusMessageType,
  STATUS_MESSAGE_PREFIX,
  ExecutionType,
  CsaViewMode,
} from '@cdo/apps/javalab/constants';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import * as ExceptionHandler from '@cdo/apps/javalab/javabuilderExceptionHandler';
import * as TestResultHandler from '@cdo/apps/javalab/testResultHandler';

import {
  UserTestResultSignalType,
  TestStatus,
} from '../../../src/javalab/constants';
import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('JavabuilderConnection', () => {
  let onOutputMessage,
    handleException,
    connection,
    setIsRunning,
    setIsTesting,
    handleTestResult,
    onValidationPassed,
    onValidationFailed;

  beforeEach(() => {
    sinon.stub(project, 'getCurrentId');
    onOutputMessage = sinon.stub();
    handleException = sinon.stub(ExceptionHandler, 'handleException');
    handleTestResult = sinon.stub(TestResultHandler, 'onTestResult');
    onValidationPassed = sinon.stub();
    onValidationFailed = sinon.stub();
    setIsRunning = sinon.stub();
    setIsTesting = sinon.stub();
    connection = new JavabuilderConnection(
      onOutputMessage,
      null,
      null,
      null,
      sinon.stub(),
      setIsRunning,
      setIsTesting,
      ExecutionType.RUN,
      CsaViewMode.NEIGHBORHOOD,
      null,
      null,
      null,
      onValidationPassed,
      onValidationFailed
    );
  });

  afterEach(() => {
    ExceptionHandler.handleException.restore();
    TestResultHandler.onTestResult.restore();
    project.getCurrentId.restore();
  });

  describe('onMessage', () => {
    it('passes the parsed event data to the exception handler', () => {
      const data = {
        type: WebSocketMessageType.EXCEPTION,
        value: 'my exception',
      };
      const event = {
        data: JSON.stringify(data),
      };
      connection.onMessage(event);
      expect(handleException).to.have.been.calledWith(data, onOutputMessage);
    });

    it('passes the data value for system out', () => {
      const data = {
        type: WebSocketMessageType.SYSTEM_OUT,
        value: 'my system out message',
      };
      const event = {
        data: JSON.stringify(data),
      };
      connection.onMessage(event);
      expect(onOutputMessage).to.have.been.calledWith(data.value);
    });

    it('passes the parsed event data to the test result handler for test results', () => {
      const data = {
        type: WebSocketMessageType.TEST_RESULT,
        value: UserTestResultSignalType.TEST_STATUS,
        detail: {
          status: TestStatus.SUCCESSFUL,
          className: 'MyTestClass',
          methodName: 'myTestMethod',
        },
      };
      const event = {
        data: JSON.stringify(data),
      };
      handleTestResult.returns({
        success: true,
        isValidation: false,
      });
      connection.onMessage(event);
      expect(handleTestResult).to.have.been.calledWith(data, onOutputMessage);
    });

    it('appends [JAVALAB] to status messages', () => {
      const data = {
        type: WebSocketMessageType.STATUS,
        value: StatusMessageType.COMPILING,
      };
      const event = {
        data: JSON.stringify(data),
      };
      connection.onMessage(event);
      expect(onOutputMessage).to.have.been.calledWith(
        `${STATUS_MESSAGE_PREFIX} Compiling...`
      );
    });
  });

  describe('onClose', () => {
    it('closes web socket on closeConnection', () => {
      const closeStub = sinon.stub();
      sinon.stub(window, 'WebSocket').returns({
        close: closeStub,
      });
      const javabuilderConnection = new JavabuilderConnection(
        onOutputMessage,
        null,
        null,
        null,
        sinon.stub()
      );

      javabuilderConnection.establishWebsocketConnection('fake-token');
      javabuilderConnection.closeConnection();

      expect(closeStub).to.have.been.calledOnce;
      expect(onOutputMessage).to.have.been.calledWith(
        `${STATUS_MESSAGE_PREFIX} Program stopped.`
      );
      window.WebSocket.restore();
    });
  });

  describe('handleExecutionFinished', () => {
    it('Sets running to false if execution type RUN has finished', () => {
      const connection = createJavabuilderConnection(ExecutionType.RUN);

      connection.handleExecutionFinished();

      sinon.assert.calledWith(setIsRunning, false);
      sinon.assert.notCalled(setIsTesting);
    });

    it('Sets testing to false if execution type TEST has finished', () => {
      const connection = createJavabuilderConnection(ExecutionType.TEST);

      connection.handleExecutionFinished();

      sinon.assert.calledWith(setIsTesting, false);
      sinon.assert.notCalled(setIsRunning);
    });

    it('Calls validation passed if validation passed', () => {
      const data = {
        type: WebSocketMessageType.TEST_RESULT,
        value: UserTestResultSignalType.TEST_STATUS,
        detail: {
          status: TestStatus.SUCCESSFUL,
          className: 'MyTestClass',
          methodName: 'myTestMethod',
        },
      };
      const event = {
        data: JSON.stringify(data),
      };
      handleTestResult.returns({
        success: true,
        isValidation: true,
      });
      // send a single passed validation message
      connection.onMessage(event);
      connection.handleExecutionFinished();
      sinon.assert.called(onValidationPassed);
      sinon.assert.notCalled(onValidationFailed);
    });

    it('Calls validation failed if validation failed', () => {
      const data = {
        type: WebSocketMessageType.TEST_RESULT,
        value: UserTestResultSignalType.TEST_STATUS,
        detail: {
          status: TestStatus.SUCCESSFUL,
          className: 'MyTestClass',
          methodName: 'myTestMethod',
        },
      };
      const event = {
        data: JSON.stringify(data),
      };
      // two tests, first succeeds, second passes
      handleTestResult.onCall(0).returns({
        success: true,
        isValidation: true,
      });
      handleTestResult.onCall(1).returns({
        success: false,
        isValidation: true,
      });
      connection.onMessage(event);
      connection.onMessage(event);
      connection.handleExecutionFinished();
      sinon.assert.called(onValidationFailed);
      sinon.assert.notCalled(onValidationPassed);
    });

    it('Does not call validation passed or failed if no validation tests were seen', () => {
      const data = {
        type: WebSocketMessageType.TEST_RESULT,
        value: UserTestResultSignalType.TEST_STATUS,
        detail: {
          status: TestStatus.SUCCESSFUL,
          className: 'MyTestClass',
          methodName: 'myTestMethod',
        },
      };
      const event = {
        data: JSON.stringify(data),
      };
      handleTestResult.returns({
        success: true,
        isValidation: false,
      });
      connection.onMessage(event);
      connection.handleExecutionFinished();
      sinon.assert.notCalled(onValidationFailed);
      sinon.assert.notCalled(onValidationPassed);
    });

    function createJavabuilderConnection(executionType) {
      return new JavabuilderConnection(
        onOutputMessage,
        null,
        null,
        null,
        sinon.stub(),
        setIsRunning,
        setIsTesting,
        executionType,
        CsaViewMode.NEIGHBORHOOD
      );
    }
  });
});
