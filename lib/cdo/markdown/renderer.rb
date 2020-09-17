require 'redcarpet'

module Cdo
  module Markdown
    class Renderer < Redcarpet::Render::HTML
      OPTIONS = {
        autolink: true,
        tables: true,
        space_after_headers: true,
        fenced_code_blocks: true,
        lax_spacing: true
      }.freeze

      def postprocess(full_document)
        process_div_brackets(full_document)
      end

      private

      # CDO-Markdown div_brackets extension.
      # Convert `[tag]...[/tag]` to `<div class='tag'>...</div>`.
      def process_div_brackets(full_document)
        full_document.
          gsub(/<p>\[\/(.*)\]<\/p>/, '</div>').
          gsub(/<p>\[(.*)\]<\/p>/) do
          value = $1
          if value[0] == '#'
            attribute = 'id'
            value = value[1..-1]
          else
            attribute = 'class'
          end

          "<div #{attribute}='#{value}'>"
        end
      end
    end
  end
end
