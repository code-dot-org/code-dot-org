import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import {removeDisallowedHtmlContent} from '@cdo/apps/weblab/brambleUtils';

const DISALLOWED_HTML_TAGS = ['script', 'a'];
const validHtmlFile = `<!DOCTYPE html>
<html>
  <body>
    <p>Important paragraph.</p>
  </body>
</html>`;
const invalidHtmlFile = `<!DOCTYPE html>
<html>
  <body>
    <script src="index.js">
    </script>
    Content outside diallowed tag <a href="/some.url">I will be deleted!</a>
    <div>divs are allowed</div>
  </body>
</html>`;
const fixedInvalidHtmlFile = `<!DOCTYPE html>
<html>
  <head>

  </head>
  <body>
    Content outside diallowed tag 
    <div>divs are allowed</div>
  </body>
</html>`;

describe('removeDisallowedHtmlContent', () => {
  let fileSystemStub, brambleProxyStub, callbackSpy;

  beforeEach(() => {
    fileSystemStub = {
      readFile: sinon.spy(),
      writeFile: sinon.spy()
    };
    brambleProxyStub = {
      enableReadOnly: sinon.spy()
    };
    callbackSpy = sinon.spy();
  });

  it('no-ops if path does not point to an HTML file', () => {
    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/style.css',
      DISALLOWED_HTML_TAGS,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.not.have.been.called;
    expect(fileSystemStub.writeFile).to.not.have.been.called;
    expect(brambleProxyStub.enableReadOnly).to.not.have.been.called;
    expect(callbackSpy).to.have.been.calledOnceWith('/style.css');
  });

  it('no-ops if reading file errored', () => {
    fileSystemStub.readFile = sinon
      .stub()
      .callsFake((path, encoding, callback) => {
        callback(new Error('uh oh!'), null);
      });

    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/index.html',
      DISALLOWED_HTML_TAGS,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.have.been.calledOnce;
    expect(fileSystemStub.writeFile).to.not.have.been.called;
    expect(brambleProxyStub.enableReadOnly).to.not.have.been.called;
    expect(callbackSpy).to.have.been.calledOnceWith('/index.html');
  });

  it('no-ops if file contents do not contain disallowed content', () => {
    fileSystemStub.readFile = sinon
      .stub()
      .callsFake((path, encoding, callback) => {
        callback(null, validHtmlFile);
      });

    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/index.html',
      DISALLOWED_HTML_TAGS,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.have.been.calledOnce;
    expect(fileSystemStub.writeFile).to.not.have.been.called;
    expect(brambleProxyStub.enableReadOnly).to.not.have.been.called;
    expect(callbackSpy).to.have.been.calledOnceWith('/index.html');
  });

  it('writes the file without disallowed content', () => {
    fileSystemStub.readFile = sinon
      .stub()
      .callsFake((path, encoding, callback) => {
        callback(null, invalidHtmlFile);
      });

    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/index.html',
      DISALLOWED_HTML_TAGS,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.have.been.calledOnce;
    expect(brambleProxyStub.enableReadOnly).to.have.been.calledOnce;
    expect(fileSystemStub.writeFile).to.have.been.calledOnce;
    const actualFileData = fileSystemStub.writeFile
      .getCall(0)
      .args[1].toString();
    expect(actualFileData).to.equal(fixedInvalidHtmlFile);
  });
});
