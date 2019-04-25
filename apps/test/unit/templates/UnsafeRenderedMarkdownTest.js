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
      '<div><p><strong>some</strong> <em>basic</em> <a href="markdown">inline</a></p>\n</div>'
    );
  });

  it('will render raw html', () => {
    const basicWrapper = shallow(
      <UnsafeRenderedMarkdown markdown='<strong>some</strong> <em>basic</em> <a href="markdown">inline</a>' />
    );

    expect(basicWrapper.html()).to.equal(
      '<div><p><strong>some</strong> <em>basic</em> <a href="markdown">inline</a></p>\n</div>'
    );

    const advancedWrapper = shallow(
      <UnsafeRenderedMarkdown markdown="<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>" />
    );

    expect(advancedWrapper.html()).to.equal(
      '<div><table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>\n</div>'
    );
  });

  it('implements expandableImages', () => {
    const regularImage = shallow(
      <UnsafeRenderedMarkdown markdown="![regular](http://example.com/img.jpg)" />
    );

    expect(regularImage.html()).to.equal(
      '<div><p><img src="http://example.com/img.jpg" alt="regular"></p>\n</div>'
    );

    const expandableImage = shallow(
      <UnsafeRenderedMarkdown markdown="![expandable](http://example.com/img.jpg)" />
    );

    expect(expandableImage.html()).to.equal(
      '<div><p><span data-url="http://example.com/img.jpg" class="expandable-image"></span></p>\n</div>'
    );
  });

  it('renders XML as top level block when appropriate', () => {
    const inlineXml = shallow(
      <UnsafeRenderedMarkdown markdown="Text with <xml><block type='xml'></block></xml> inline" />
    );

    expect(inlineXml.html()).to.equal(
      "<div><p>Text with <xml><block type='xml'></block></xml> inline</p>\n</div>"
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
      "<div><p>Text with</p>\n<xml><block type='xml'></block></xml>\n<p>in its own block</p>\n</div>"
    );
  });

  // TODO let's make this test not be true anymore
  it('is vulnerable to JS injection', () => {
    const scriptTagInjection = shallow(
      <UnsafeRenderedMarkdown markdown='<script type="text/javascript">alert("hello!")</script>' />
    );

    expect(scriptTagInjection.html()).to.equal(
      '<div><script type="text/javascript">alert("hello!")</script>\n</div>'
    );

    const inlineEventInjection = shallow(
      <UnsafeRenderedMarkdown markdown='<div onmouseover="alert("hello!")"></div>' />
    );

    expect(inlineEventInjection.html()).to.equal(
      '<div><div onmouseover="alert("hello!")"></div>\n</div>'
    );

    const iframeInjection = shallow(
      <UnsafeRenderedMarkdown
        markdown={`<iframe src="javascript:alert('hello')"></iframe>`}
      />
    );

    expect(iframeInjection.html()).to.equal(
      '<div><iframe src="javascript:alert(\'hello\')"></iframe>\n</div>'
    );
  });
});
