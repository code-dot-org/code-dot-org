# Add Markdown .md support to the ActionView template system.

require 'cdo/honeybadger'
require 'cdo/markdown/renderer'
require 'redcarpet'

MARKDOWN_OPTIONS = {
  autolink: true,
  tables: true,
  space_after_headers: true
}.freeze

# Temporarily use this instead of the standard Cdo::Markdown::Handler so we can
# render using both the new and old renderers side-by-side and compare the
# results. We will still return the old result, but will notify Honeybadger if
# they are different so we can identify potential changes before switching
# over.
class InterimMarkdownHandler
  def initialize
    @old_parser = Redcarpet::Markdown.new(Redcarpet::Render::HTML, MARKDOWN_OPTIONS)
    @new_parser = Redcarpet::Markdown.new(Cdo::Markdown::Renderer, Cdo::Markdown::Renderer::OPTIONS)
  end

  def call(template)
    old_result = @old_parser.render(template.source)
    new_result = @new_parser.render(template.source)

    if old_result != new_result
      Honeybadger.notify(
        error_class: 'Rendering differences between new and old Dashboard markdown',
        error_message: "template #{template.identifier.inspect} renders differently with new renderer than with old",
        context: {
          old_result: old_result,
          new_result: new_result,
          template: template
        }
      )
    end

    "#{old_result.inspect}.html_safe"
  end
end

ActionView::Template.register_template_handler :md, InterimMarkdownHandler.new
