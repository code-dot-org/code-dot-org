import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import {executeUserCode} from '@cdo/apps/craft/code-connection/craft';

describe('Craft', () => {
  it('move forward block', done => {
    sinon.stub(studioApp(), 'highlight');

    const mockClient = {
      async_command: command => {
        expect(command).to.eql('move?direction=forward');
        done();
      }
    };
    executeUserCode(mockClient, 'move(0, "forward")');
  });
});
