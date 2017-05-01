require 'redcarpet'
require 'redcarpet/render_strip'

# A markdown renderer that strips everything, except for codespans (via backticks)
module RestrictedMarkdownHelper
  class CodeSpanOnly < Redcarpet::Render::StripDown
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

  RestrictedRenderer = Redcarpet::Markdown.new(CodeSpanOnly)

  def render_restricted_markdown(markdown)
    RestrictedRenderer.render(markdown)
  end
end
