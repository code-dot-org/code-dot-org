import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';
import MarkdownSpan from '@cdo/apps/code-studio/pd/components/markdownSpan';

describe("MarkdownSpan", () => {
  it("Renders the supplied markdown in a span element", () => {
    const markdownSpan = shallow(
      <MarkdownSpan>
        normal text *bold text*
      </MarkdownSpan>
    );

    expect(markdownSpan).to.have.html(
      "<span>normal text <em>bold text</em></span>"
    );
  });

  it("Renders links with target=_blank", () => {
    const markdownSpan = shallow(
      <MarkdownSpan>
        This is a [link](https://code.org).
      </MarkdownSpan>
    );

    expect(markdownSpan).to.have.html(
      '<span>This is a <a href="https://code.org" target="_blank">link</a>.</span>'
    );
  });

  it("Applies the supplied style to the rendered span", () => {
    const markdownSpan = shallow(
      <MarkdownSpan style={{fontFamily: "Gotham 7r"}}>
        text
      </MarkdownSpan>
    );

    expect(markdownSpan).to.containMatchingElement(
      <span style={{fontFamily: "Gotham 7r"}}/>
    );
  });
});
