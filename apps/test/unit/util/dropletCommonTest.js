import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';
import DropletCommon from '@cdo/apps/util/dropletCommon';

describe('dropletCommon.findDropletParseErrors', () => {
  it('returns false when given no editor', () => {
    expect(DropletCommon.findDropletParseErrors()).to.be.false;
  });

  it('returns false when the parser finds no errors', () => {
    const editor = {parse: () => {}};
    expect(DropletCommon.findDropletParseErrors(editor)).to.be.false;
  });

  it('returns true when the parser finds codeBlock errors', () => {
    const error = {line: 5, type: 'IncorrectBlockParent', message: 'test'};
    const callback = sinon.spy();
    replaceOnWindow('dashboard', {
      project: {
        getShareUrl: () => {}
      }
    });
    sinon.stub(window.dashboard.project, 'getShareUrl');
    const editor = {
      parse: () => {
        throw new Error(JSON.stringify(error));
      }
    };
    expect(DropletCommon.findDropletParseErrors(editor, callback)).to.be.true;
    expect(callback).to.have.been.calledWith(error.line + 1, error.message);
    window.dashboard.project.getShareUrl.restore();
    restoreOnWindow('dashboard');
  });

  it('returns true when the parser finds errors with line numbers', () => {
    const error = {line: 5, type: 'DropletParseError', message: 'test message'};
    replaceOnWindow('dashboard', {
      project: {
        getShareUrl: () => {}
      }
    });
    sinon.stub(window.dashboard.project, 'getShareUrl');
    const callback = sinon.spy();
    const editor = {
      parse: () => {
        throw new Error(JSON.stringify(error));
      }
    };
    expect(DropletCommon.findDropletParseErrors(editor, callback)).to.be.true;
    expect(callback).to.have.been.calledWith(error.line + 1, error.message);
    window.dashboard.project.getShareUrl.restore();
    restoreOnWindow('dashboard');
  });

  it('returns true when the parser finds errors without line numbers', () => {
    const errorMessage = 'error message';
    const callback = sinon.spy();
    const editor = {
      parse: () => {
        throw new Error(errorMessage);
      }
    };
    expect(DropletCommon.findDropletParseErrors(editor, callback)).to.be.true;
    expect(callback).to.have.been.calledWith(0, errorMessage);
  });
});
