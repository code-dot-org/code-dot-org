require 'action_view'
require 'redcarpet'

module Cdo
  module Markdown
    # A simple helper to capture the logic of registering a markdown handler with
    # ActionView
    class Handler
      def initialize(renderer=Redcarpet::Render::HTML, options={})
        @parser = Redcarpet::Markdown.new(renderer, options)
      end

      def call(template)
        "#{@parser.render(template.source).inspect}.html_safe"
      end

      def self.register(*args)
        ActionView::Template.register_template_handler :md, Handler.new(*args)
      end

      def self.register_html_safe(*args)
        ActionView::Template.register_template_handler :safe_md, Handler.new(*args)
      end

      def self.register_inline(*args)
        ActionView::Template.register_template_handler :inline_md, Handler.new(*args)
      end
    end
  end
end
