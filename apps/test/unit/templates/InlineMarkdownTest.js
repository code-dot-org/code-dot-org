import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    ).toBe(true);
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
    ).toBe(true);
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
    ).toBe(true);
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

    // inline html is ignored
    expect(basicWrapper.equals(<span>some basic inline</span>)).toBe(true);

    const advancedWrapper = shallow(
      <InlineMarkdown markdown="<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>" />
    );

    // block html is ignored
    expect(
      advancedWrapper.equals(
        <span>Some advanced htmlnot usually supported by markdown</span>
      )
    ).toBe(true);
  });

  // This test was added as part of a change to prevent this component from
  // erroring out. See https://github.com/code-dot-org/code-dot-org/pull/49585
  // for more info.
  it('renders InlineMarkdown with trailing newline', () => {
    shallow(
      <InlineMarkdown
        markdown={'some markdown with an _accidental_ new line \n'}
      />
    );
  });
});
