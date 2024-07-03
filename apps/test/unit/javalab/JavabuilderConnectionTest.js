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
    jest.spyOn(project, 'getCurrentId').mockClear().mockImplementation();
    onOutputMessage = jest.fn();
    handleException = jest.spyOn(ExceptionHandler, 'handleException').mockClear().mockImplementation();
    handleTestResult = jest.spyOn(TestResultHandler, 'onTestResult').mockClear().mockImplementation();
    onValidationPassed = jest.fn();
    onValidationFailed = jest.fn();
    setIsRunning = jest.fn();
    setIsTesting = jest.fn();
    connection = new JavabuilderConnection(
      onOutputMessage,
      null,
      null,
      null,
      jest.fn(),
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
    ExceptionHandler.handleException.mockRestore();
    TestResultHandler.onTestResult.mockRestore();
    project.getCurrentId.mockRestore();
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
      expect(handleException).toHaveBeenCalledWith(data, onOutputMessage);
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
      expect(onOutputMessage).toHaveBeenCalledWith(data.value);
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
      handleTestResult.mockReturnValue({
        success: true,
        isValidation: false,
      });
      connection.onMessage(event);
      expect(handleTestResult).toHaveBeenCalledWith(data, onOutputMessage);
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
      expect(onOutputMessage).toHaveBeenCalledWith(`${STATUS_MESSAGE_PREFIX} Compiling...`);
    });
  });

  describe('onClose', () => {
    it('closes web socket on closeConnection', () => {
      const closeStub = jest.fn();
      jest.spyOn(window, 'WebSocket').mockClear().mockReturnValue({
        close: closeStub,
      });
      const javabuilderConnection = new JavabuilderConnection(
        onOutputMessage,
        null,
        null,
        null,
        jest.fn()
      );

      javabuilderConnection.establishWebsocketConnection('fake-token');
      javabuilderConnection.closeConnection();

      expect(closeStub).toHaveBeenCalledTimes(1);
      expect(onOutputMessage).toHaveBeenCalledWith(`${STATUS_MESSAGE_PREFIX} Program stopped.`);
      window.WebSocket.mockRestore();
    });
  });

  describe('handleExecutionFinished', () => {
    it('Sets running to false if execution type RUN has finished', () => {
      const connection = createJavabuilderConnection(ExecutionType.RUN);

      connection.handleExecutionFinished();

      expect(setIsRunning).toHaveBeenCalledWith(false);
      expect(setIsTesting).not.toHaveBeenCalled();
    });

    it('Sets testing to false if execution type TEST has finished', () => {
      const connection = createJavabuilderConnection(ExecutionType.TEST);

      connection.handleExecutionFinished();

      expect(setIsTesting).toHaveBeenCalledWith(false);
      expect(setIsRunning).not.toHaveBeenCalled();
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
      handleTestResult.mockReturnValue({
        success: true,
        isValidation: true,
      });
      // send a single passed validation message
      connection.onMessage(event);
      connection.handleExecutionFinished();
      sinon.toHaveBeenCalled();
      expect(onValidationFailed).not.toHaveBeenCalled();
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
      handleTestResult.mockImplementation(() => {
        if (handleTestResult.mock.calls.length === 0) {
          return {
            success: true,
            isValidation: true,
          };
        }
      });
      handleTestResult.mockImplementation(() => {
        if (handleTestResult.mock.calls.length === 1) {
          return {
            success: false,
            isValidation: true,
          };
        }
      });
      connection.onMessage(event);
      connection.onMessage(event);
      connection.handleExecutionFinished();
      sinon.toHaveBeenCalled();
      expect(onValidationPassed).not.toHaveBeenCalled();
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
      handleTestResult.mockReturnValue({
        success: true,
        isValidation: false,
      });
      connection.onMessage(event);
      connection.handleExecutionFinished();
      expect(onValidationFailed).not.toHaveBeenCalled();
      expect(onValidationPassed).not.toHaveBeenCalled();
    });

    function createJavabuilderConnection(executionType) {
      return new JavabuilderConnection(
        onOutputMessage,
        null,
        null,
        null,
        jest.fn(),
        setIsRunning,
        setIsTesting,
        executionType,
        CsaViewMode.NEIGHBORHOOD
      );
    }
  });
});
