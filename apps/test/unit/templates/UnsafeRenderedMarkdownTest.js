import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

describe('UnsafeRenderedMarkdown', () => {
  it('will render basic markdown', () => {
    const wrapper = shallow(
      <UnsafeRenderedMarkdown markdown="**some** _basic_ [inline](markdown)" />
    );

    expect(wrapper.html()).to.equal(
      '<div><p><strong>some</strong> <em>basic</em> <a href="markdown">inline</a></p></div>'
    );
  });

  it('will render raw html', () => {
    const basicWrapper = shallow(
      <UnsafeRenderedMarkdown markdown='<strong>some</strong> <em>basic</em> <a href="markdown">inline</a>' />
    );

    expect(basicWrapper.html()).to.equal(
      '<div><p><strong>some</strong> <em>basic</em> <a href="markdown">inline</a></p></div>'
    );

    const advancedWrapper = shallow(
      <UnsafeRenderedMarkdown markdown="<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>" />
    );

    // note the output has added <tr> tags as appropriate
    expect(advancedWrapper.html()).to.equal(
      '<div><table><thead><tr><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></tr></thead></table></div>'
    );
  });

  it('implements expandableImages', () => {
    const regularImage = shallow(
      <UnsafeRenderedMarkdown markdown="![regular](http://example.com/img.jpg)" />
    );

    expect(regularImage.html()).to.equal(
      '<div><p><img src="http://example.com/img.jpg" alt="regular"/></p></div>'
    );

    const expandableImage = shallow(
      <UnsafeRenderedMarkdown markdown="![expandable](http://example.com/img.jpg)" />
    );

    expect(expandableImage.html()).to.equal(
      '<div><p><span data-url="http://example.com/img.jpg" class="expandable-image"></span></p></div>'
    );
  });

  it('renders XML as top level block when appropriate', () => {
    const inlineXml = shallow(
      <UnsafeRenderedMarkdown markdown="Text with <xml><block type='xml'></block></xml> inline" />
    );

    expect(inlineXml.html()).to.equal(
      '<div><p>Text with <xml><block type="xml"></block></xml> inline</p></div>'
    );

    // Need to use markdown={} rather than markdown="" here so React doesn't
    // escape the newlines
    const blockXml = shallow(
      <UnsafeRenderedMarkdown
        markdown={
          "Text with\n\n<xml><block type='xml'></block></xml>\n\nin its own block"
        }
      />
    );

    expect(blockXml.html()).to.equal(
      '<div><p>Text with</p>\n<xml><block type="xml"></block></xml>\n<p>in its own block</p></div>'
    );
  });

  it('renders links normally by default', () => {
    const externalLink = shallow(
      <UnsafeRenderedMarkdown markdown="[external link](example.com)" />
    );
    expect(externalLink.html()).to.equal(
      '<div><p><a href="example.com">external link</a></p></div>'
    );

    const internalLink = shallow(
      <UnsafeRenderedMarkdown markdown="[internal link](code.org)" />
    );
    expect(internalLink.html()).to.equal(
      '<div><p><a href="code.org">internal link</a></p></div>'
    );
  });

  it('will open links in a new tab if specified', () => {
    const externalLink = shallow(
      <UnsafeRenderedMarkdown
        openExternalLinksInNewTab
        markdown="[external link](example.com)"
      />
    );
    expect(externalLink.html()).to.equal(
      '<div><p><a href="example.com" target="_blank" rel="noreferrer noopener">external link</a></p></div>'
    );

    const internalLink = shallow(
      <UnsafeRenderedMarkdown
        openExternalLinksInNewTab
        markdown="[internal link](code.org)"
      />
    );
    expect(internalLink.html()).to.equal(
      '<div><p><a href="code.org" target="_blank" rel="noreferrer noopener">internal link</a></p></div>'
    );
  });

  // TODO let's make this test not be true anymore
  it('is vulnerable to JS injection', () => {
    const scriptTagInjection = shallow(
      <UnsafeRenderedMarkdown markdown='<script type="text/javascript">alert(&#x22;hello!&#x22;)</script>' />
    );

    expect(scriptTagInjection.html()).to.equal(
      '<div><script type="text/javascript">alert(&quot;hello!&quot;)</script></div>'
    );

    const inlineEventInjection = shallow(
      <UnsafeRenderedMarkdown markdown='<div onMouseOver="alert("hello!")"></div>' />
    );

    expect(inlineEventInjection.html()).to.equal(
      '<div><div onMouseOver="alert(&quot;hello!&quot;)"></div></div>'
    );

    const iframeInjection = shallow(
      <UnsafeRenderedMarkdown
        markdown={`<iframe src="javascript:alert('hello')"></iframe>`}
      />
    );

    expect(iframeInjection.html()).to.equal(
      '<div><iframe src="javascript:alert(\'hello\')"></iframe></div>'
    );
  });
});
