require 'action_view'
require 'redcarpet'

# A simple helper to capture the logic of registering a markdown handler with
# ActionView
class MarkdownHandler
  def initialize(renderer=Redcarpet::Render::HTML, options={})
    @parser = Redcarpet::Markdown.new(renderer, options)
  end

  def call(template)
    "#{@parser.render(template.source).inspect}.html_safe"
  end

  def self.register(*args)
    handler = MarkdownHandler.new(*args)
    ActionView::Template.register_template_handler(:md, handler)
  end

  def self.registered
    ActionView::Template.registered_template_handler(:md)
  end

  def self.registered?
    registered.present?
  end
end
