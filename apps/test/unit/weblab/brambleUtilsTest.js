import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import {removeDisallowedHtmlContent} from '@cdo/apps/weblab/brambleUtils';

// This regex is meant to mimic the way we disallow certain HTML tags in WebLab.js.
const REGEX = new RegExp(`<(script|a)[\\s\\S]*\\/(script|a)*>`, 'gi');

describe('removeDisallowedHtmlContent', () => {
  let fileSystemStub, brambleProxyStub, callbackSpy;

  beforeEach(() => {
    fileSystemStub = {
      readFile: sinon.spy(),
      writeFile: sinon.spy()
    };
    brambleProxyStub = {
      enableReadonly: sinon.spy()
    };
    callbackSpy = sinon.spy();
  });

  it('no-ops if path does not point to an HTML file', () => {
    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/style.css',
      REGEX,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.not.have.been.called;
    expect(fileSystemStub.writeFile).to.not.have.been.called;
    expect(brambleProxyStub.enableReadonly).to.not.have.been.called;
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
      REGEX,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.have.been.calledOnce;
    expect(fileSystemStub.writeFile).to.not.have.been.called;
    expect(brambleProxyStub.enableReadonly).to.not.have.been.called;
    expect(callbackSpy).to.have.been.calledOnceWith('/index.html');
  });

  it('no-ops if file contents do not contain disallowed content', () => {
    fileSystemStub.readFile = sinon
      .stub()
      .callsFake((path, encoding, callback) => {
        const fileData = `<!DOCTYPE html>
        <html>
          <body>
            <p>Important paragraph.</p>
          </body>
        </html>
        `;
        callback(null, fileData);
      });

    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/index.html',
      REGEX,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.have.been.calledOnce;
    expect(fileSystemStub.writeFile).to.not.have.been.called;
    expect(brambleProxyStub.enableReadonly).to.not.have.been.called;
    expect(callbackSpy).to.have.been.calledOnceWith('/index.html');
  });

  it('writes the file without disallowed content', () => {
    // Based on REGEX, both <script> and <a> tags should be removed from the template below.
    const invalidFileData = `<!DOCTYPE html>
    <html>
      <body>
        <script src="index.js">
        </script>
        <a href="/some.url">I will be deleted!</a>
        <div>divs are allowed</div>
      </body>
    </html>
    `;
    const expectedFileData = `<!DOCTYPE html>
    <html>
      <body>
        
        <div>divs are allowed</div>
      </body>
    </html>
    `;
    fileSystemStub.readFile = sinon
      .stub()
      .callsFake((path, encoding, callback) => {
        callback(null, invalidFileData);
      });

    removeDisallowedHtmlContent(
      fileSystemStub,
      brambleProxyStub,
      '/index.html',
      REGEX,
      callbackSpy
    );

    expect(fileSystemStub.readFile).to.have.been.calledOnce;
    expect(brambleProxyStub.enableReadonly).to.have.been.calledOnce;
    expect(fileSystemStub.writeFile).to.have.been.calledOnce;
    const actualFileData = fileSystemStub.writeFile
      .getCall(0)
      .args[1].toString();
    expect(actualFileData).to.equal(expectedFileData);
  });
});
