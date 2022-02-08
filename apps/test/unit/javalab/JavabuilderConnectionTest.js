import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import {
  WebSocketMessageType,
  StatusMessageType,
  STATUS_MESSAGE_PREFIX,
  ExecutionType,
  CsaViewMode
} from '@cdo/apps/javalab/constants';
import * as ExceptionHandler from '@cdo/apps/javalab/javabuilderExceptionHandler';
import project from '@cdo/apps/code-studio/initApp/project';

describe('JavabuilderConnection', () => {
  let onOutputMessage, handleException, connection, setIsRunning, setIsTesting;

  beforeEach(() => {
    sinon.stub(project, 'getCurrentId');
    onOutputMessage = sinon.stub();
    handleException = sinon.stub(ExceptionHandler, 'handleException');
    setIsRunning = sinon.stub();
    setIsTesting = sinon.stub();
    connection = new JavabuilderConnection(
      null,
      onOutputMessage,
      null,
      null,
      null,
      sinon.stub(),
      setIsRunning,
      setIsTesting,
      ExecutionType.RUN,
      CsaViewMode.NEIGHBORHOOD
    );
  });

  afterEach(() => {
    ExceptionHandler.handleException.restore();
    project.getCurrentId.restore();
  });

  describe('onMessage', () => {
    it('passes the parsed event data to the exception handler', () => {
      const data = {
        type: WebSocketMessageType.EXCEPTION,
        value: 'my exception'
      };
      const event = {
        data: JSON.stringify(data)
      };
      connection.onMessage(event);
      expect(handleException).to.have.been.calledWith(data, onOutputMessage);
    });

    it('passes the data value for system out', () => {
      const data = {
        type: WebSocketMessageType.SYSTEM_OUT,
        value: 'my system out message'
      };
      const event = {
        data: JSON.stringify(data)
      };
      connection.onMessage(event);
      expect(onOutputMessage).to.have.been.calledWith(data.value);
    });

    it('passes the data value for test results', () => {
      const data = {
        type: WebSocketMessageType.TEST_RESULT,
        value: 'your test has passed!'
      };
      const event = {
        data: JSON.stringify(data)
      };
      connection.onMessage(event);
      expect(onOutputMessage).to.have.been.calledWith(data.value);
    });

    it('appends [JAVALAB] to status messages', () => {
      const data = {
        type: WebSocketMessageType.STATUS,
        value: StatusMessageType.COMPILING
      };
      const event = {
        data: JSON.stringify(data)
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
        close: closeStub
      });
      const javabuilderConnection = new JavabuilderConnection(null, () => {});
      javabuilderConnection.establishWebsocketConnection('fake-token');
      javabuilderConnection.closeConnection();
      expect(closeStub).to.have.been.calledOnce;
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

    function createJavabuilderConnection(executionType) {
      return new JavabuilderConnection(
        null,
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
