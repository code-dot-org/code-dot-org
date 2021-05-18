import sinon from 'sinon';
import {expect} from '../../util/reconfiguredChai';
import JavabuilderConnection from '@cdo/apps/javalab/JavabuilderConnection';
import {WebSocketMessageType} from '@cdo/apps/javalab/constants';
import * as ExceptionHandler from '@cdo/apps/javalab/javabuilderExceptionHandler';

describe('JavabuilderConnection', () => {
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
      const connection = new JavabuilderConnection(null, null, onOutputMessage);
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
      const connection = new JavabuilderConnection(null, null, onOutputMessage);
      connection.onMessage(event);
      expect(onOutputMessage).to.have.been.calledWith(data.value);
    });
  });
});
