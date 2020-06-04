import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';

describe('InlineMarkdown', () => {
  it('will render basic inline markdown', () => {
    const wrapper = shallow(
      <InlineMarkdown markdown="**some** _basic_ [inline](markdown)" />
    );

    expect(
      wrapper.equals(
        <span>
          <strong>some</strong> <em>basic</em> <a href="markdown">inline</a>
        </span>
      )
    ).to.equal(true);
  });

  it('will refuse to render block elements', () => {
    const wrapper = shallow(
      <InlineMarkdown markdown="markdown which contains\n\n- some\n - basic\n\n> block elements" />
    );

    expect(
      wrapper.equals(
        <span>
          markdown which contains\n\n- some\n - basic\n\n&gt; block elements
        </span>
      )
    ).to.equal(true);
  });

  it('will ignore what would normally be a paragraph break', () => {
    const wrapper = shallow(
      <InlineMarkdown markdown="**some** _basic_ [inline](markdown)\n\nand **yet more** markdown in a _second_ paragraph" />
    );

    expect(
      wrapper.equals(
        <span>
          <strong>some</strong> <em>basic</em> <a href="markdown">inline</a>
          \n\nand <strong>yet more</strong> markdown in a <em>second</em>{' '}
          paragraph
        </span>
      )
    ).to.equal(true);
  });

  it('will ignore raw html', () => {
    // Note that we _could_ add to this the ability to render raw HTML; we
    // would just need to add rehypeRaw and rehypeSanitize like we do for
    // SafeMarkdown, and curate the list of allowed tags. For now - until we
    // have a specific use case that demands this work - we simply ignore all
    // raw html.

    const basicWrapper = shallow(
      <InlineMarkdown markdown='<strong>some</strong> <em>basic</em> <a href="markdown">inline</a>' />
    );

    expect(
      basicWrapper.equals(<span>some basic inline</span>),
      'inline html is ignored'
    ).to.equal(true);

    const advancedWrapper = shallow(
      <InlineMarkdown markdown="<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>" />
    );

    expect(
      advancedWrapper.equals(
        <span>Some advanced htmlnot usually supported by markdown</span>
      ),
      'block html is ignored'
    ).to.equal(true);
  });
});
