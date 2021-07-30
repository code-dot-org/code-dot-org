import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import {WebSocketMessageType} from '@cdo/apps/javalab/constants';
import * as ExceptionHandler from '@cdo/apps/javalab/javabuilderExceptionHandler';
import project from '@cdo/apps/code-studio/initApp/project';

describe('JavabuilderConnection', () => {
  beforeEach(() => {
    sinon.stub(project, 'getCurrentId');
  });

  afterEach(() => {
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
      const onOutputMessage = sinon.stub();
      const handleException = sinon.stub(ExceptionHandler, 'handleException');
      const connection = new JavabuilderConnection(null, onOutputMessage);
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
      const onOutputMessage = sinon.stub();
      const connection = new JavabuilderConnection(null, onOutputMessage);
      connection.onMessage(event);
      expect(onOutputMessage).to.have.been.calledWith(data.value);
    });
  });

  describe('sendMessage', () => {
    it('errors when called on a connection with no socket', () => {
      const javabuilderConnection = new JavabuilderConnection(null, () => {});
      sinon.stub(console, 'error');
      javabuilderConnection.sendMessage('');
      expect(console.error).to.have.been.calledOnce;
      expect(console.error.getCall(0).args[0]).to.contain(
        '[error] The connection has closed.'
      );
      console.error.restore();
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

    it('errors on a close without a socket', () => {
      const javabuilderConnection = new JavabuilderConnection(null, () => {});
      sinon.stub(console, 'error');
      javabuilderConnection.closeConnection();
      expect(console.error).to.have.been.calledOnce;
      expect(console.error.getCall(0).args[0]).to.contain(
        '[error] There is no web socket connection.'
      );
      console.error.restore();
    });
  });
});
