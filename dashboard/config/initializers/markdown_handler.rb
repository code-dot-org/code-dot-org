# Add Markdown .md support to the ActionView template system.
module MarkdownHandler
  MARKDOWN_OPTIONS = {
    autolink: true,
    tables: true,
    space_after_headers: true
  }

  def self.call(template)
    @markdown ||= Redcarpet::Markdown.new(Redcarpet::Render::HTML, MARKDOWN_OPTIONS)
    "#{@markdown.render(template.source).inspect}.html_safe"
  end
end

ActionView::Template.register_template_handler :md, MarkdownHandler
