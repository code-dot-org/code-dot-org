import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

describe('SafeMarkdown', () => {
  it('will render basic markdown', () => {
    const wrapper = shallow(
      <SafeMarkdown markdown="**some** _basic_ [inline](markdown)" />
    );

    expect(
      wrapper.equals(
        <div>
          <p>
            <strong>some</strong> <em>basic</em> <a href="markdown">inline</a>
          </p>
        </div>
      )
    ).toBe(true);
  });

  it('will render raw html', () => {
    const basicWrapper = shallow(
      <SafeMarkdown markdown='<strong>some</strong> <em>basic</em> <a href="markdown">inline</a>' />
    );

    // inline html is rendered directly
    expect(
      basicWrapper.equals(
        <div>
          <p>
            <strong>some</strong> <em>basic</em> <a href="markdown">inline</a>
          </p>
        </div>
      )
    ).toBe(true);

    const advancedWrapper = shallow(
      <SafeMarkdown markdown="<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>" />
    );

    // note the output has added <tr> tags as appropriate
    // inline html including non-markdown-supported constructs is rendered directly
    expect(
      advancedWrapper.equals(
        <div>
          <table>
            <thead>
              <tr>
                <th>Some advanced html</th>
                <th>
                  <strong>not</strong> usually supported by markdown
                </th>
              </tr>
            </thead>
          </table>
        </div>
      )
    ).toBe(true);
  });

  it('implements expandableImages', () => {
    const regularImage = shallow(
      <SafeMarkdown markdown="![regular](http://example.com/img.jpg)" />
    );

    // regular images are rendered normally
    expect(
      regularImage.equals(
        <div>
          <p>
            <img src="http://example.com/img.jpg" alt="regular" />
          </p>
        </div>
      )
    ).toBe(true);

    const expandableImage = shallow(
      <SafeMarkdown markdown="![expandable](http://example.com/img.jpg)" />
    );

    // Enzyme doesn't like the data-url property when comparing equality
    // directly, so we use .html() as a proxy for this test
    // expandable images are rendered as custom spans
    expect(expandableImage.html()).toBe(
      shallow(
        <div>
          <p>
            <span
              data-url="http://example.com/img.jpg"
              className="expandable-image"
            />
          </p>
        </div>
      ).html()
    );
  });

  it('implements visualCodeBlocks', () => {
    const regularCodeBlock = shallow(
      <SafeMarkdown markdown="some markdown with a `regular` code block" />
    );

    // regular code blocks are rendered normally
    expect(
      regularCodeBlock.equals(
        <div>
          <p>
            some markdown with a <code>regular</code> code block
          </p>
        </div>
      )
    ).toBe(true);

    const visualCodeBlock = shallow(
      <SafeMarkdown markdown="some markdown with a `visual`(#c0ffee) code block" />
    );

    // visual code blocks are rendered with expected properties
    expect(
      visualCodeBlock.equals(
        <div>
          <p>
            some markdown with a{' '}
            <code className="visual-block" style={{backgroundColor: '#c0ffee'}}>
              visual
            </code>{' '}
            code block
          </p>
        </div>
      )
    ).toBe(true);
  });

  it('renders XML as top level block when appropriate', () => {
    const inlineXml = shallow(
      <SafeMarkdown markdown="Text with <xml><block type='xml'></block></xml> inline" />
    );

    // inline xml blocks render within their containing paragraph
    expect(inlineXml.html()).toBe(
      '<div><p>Text with <xml is="xml"><block is="block" type="xml"></block></xml> inline</p></div>'
    );

    // Need to use markdown={} rather than markdown="" here so React doesn't
    // escape the newlines
    const blockXml = shallow(
      <SafeMarkdown
        markdown={
          "Text with\n\n<xml><block type='xml'></block></xml>\n\nin its own block"
        }
      />
    );

    // Enzyme is particular about newlines when comparing raw elements, so we
    // still have to rely on rendered HTML comparison here
    // block xml blocks render as top-level elements (siblings to paragraphs)
    expect(blockXml.html()).toBe(
      '<div><p>Text with</p>\n<xml is="xml"><block is="block" type="xml"></block></xml>\n<p>in its own block</p></div>'
    );
  });

  it('renders links normally by default', () => {
    const externalLink = shallow(
      <SafeMarkdown markdown="[external link](example.com)" />
    );
    expect(
      externalLink.equals(
        <div>
          <p>
            <a href="example.com">external link</a>
          </p>
        </div>
      )
    ).toBe(true);

    const internalLink = shallow(
      <SafeMarkdown markdown="[internal link](code.org)" />
    );
    expect(
      internalLink.equals(
        <div>
          <p>
            <a href="code.org">internal link</a>
          </p>
        </div>
      )
    ).toBe(true);
  });

  it('will open links in a new tab if specified', () => {
    const externalLink = shallow(
      <SafeMarkdown
        openExternalLinksInNewTab
        markdown="[external link](example.com)"
      />
    );
    expect(
      externalLink.equals(
        <div>
          <p>
            <a href="example.com" target="_blank" rel="noreferrer noopener">
              external link
            </a>
          </p>
        </div>
      )
    ).toBe(true);

    const internalLink = shallow(
      <SafeMarkdown
        openExternalLinksInNewTab
        markdown="[internal link](code.org)"
      />
    );
    expect(
      internalLink.equals(
        <div>
          <p>
            <a href="code.org" target="_blank" rel="noreferrer noopener">
              internal link
            </a>
          </p>
        </div>
      )
    ).toBe(true);
  });

  it('is resistant to JS injection', () => {
    const scriptTagInjection = shallow(
      <SafeMarkdown markdown='<script type="text/javascript">alert(&#x22;hello!&#x22;)</script>' />
    );
    // script tags are ignored
    expect(scriptTagInjection.equals(<div />)).toBe(true);

    const inlineEventInjection = shallow(
      <SafeMarkdown markdown='<div onMouseOver="alert("hello!")"></div>' />
    );
    // event attributes are ignored
    expect(inlineEventInjection.equals(<div />)).toBe(true);

    const iframeInjection = shallow(
      <SafeMarkdown
        markdown={`<iframe src="javascript:alert('hello')"></iframe>`}
      />
    );
    // iframes are ignored
    expect(iframeInjection.equals(<div />)).toBe(true);

    const miscInjection = shallow(
      <SafeMarkdown markdown='<div><math><mi xlink:href="data:x,<script>alert(&#x22;foxtrot&#x22;)</script>"></mi></math></div>' />
    );
    // arbitrary unsupported tags are ignored and/or escaped
    expect(miscInjection.equals(<div>{'">'}</div>)).toBe(true);
  });

  it('is resistant to JS injection in XML', () => {
    const xmlJSInjection = shallow(
      <SafeMarkdown markdown='<xml onload="alert(&#x22;foxtrot&#x22;)"><block/></xml>' />
    );

    // JS events in XML are ignored
    expect(xmlJSInjection.html()).toBe(
      '<div><xml is="xml"><block is="block"></block></xml></div>'
    );
  });
});
