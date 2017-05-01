require 'redcarpet'
require 'redcarpet/render_strip'

# A markdown renderer that strips everything, except for codespans (via backticks)
module CodespanOnlyMarkdownHelper
  class CodespanOnly < Redcarpet::Render::StripDown
    def codespan(code)
      "<code>#{code}</code>"
    end

    def block_html(raw_html)
      ''
    end

    def raw_html(raw_html)
      ''
    end

    def link(link, title, content)
      ''
    end

    def image(link, title, alt_text)
      ''
    end

    # Unlike StripDown, don't append an endline
    def paragraph(text)
      text
    end
  end

  CodespanOnlyRenderer = Redcarpet::Markdown.new(CodespanOnly)

  def render_codespan_only_markdown(markdown)
    CodespanOnlyRenderer.render(markdown)
  end
end
