import {expect} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import {executeUserCode} from '@cdo/apps/craft/code-connection/craft';

describe('Code Connection extension', () => {
  it('move forward block to verify single key-value parsing', done => {
    sinon.stub(studioApp(), 'highlight');

    const mockClient = {
      async_command: command => {
        expect(command).to.eql('move?direction=forward');
        done();
      }
    };
    executeUserCode(mockClient, 'move(0, "forward")');
  });

  it('place forward block to verify multiple key-value parsing', done => {
    const mockClient = {
      async_command: command => {
        expect(command).to.eql('place?slotNum=0&direction=forward');
        done();
      }
    };
    executeUserCode(mockClient, 'place(0, "0", "forward")');
  });

  it('give block to verify item type', done => {
    const mockClient = {
      async_command: command => {
        expect(command).to.eql(
          'give?player=steve&itemName=stone&data=1&amount=2'
        );
        done();
      }
    };
    executeUserCode(mockClient, `give(0, "steve", item(0, "stone", "1"), "2")`);
  });
});
