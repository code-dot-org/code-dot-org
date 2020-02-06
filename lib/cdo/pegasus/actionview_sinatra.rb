require 'action_view'
require 'haml'
require 'haml/template'
require 'redcarpet'

#module MultiExtTemplateRenderer
#  def render_template(template, layout_name = nil, locals = nil)
#    puts "template: #{template}"
#    #puts "template.source: #{template.source}"
#    puts "template.formats: #{template.formats}"
#    puts "template.virtual_path: #{template.virtual_path}"
#    puts "template.type: #{template.type}"
#    puts "template.handler: #{template.handler}"
#    puts "layout_name: #{layout_name}"
#    super
#  end
#end
#ActionView::TemplateRenderer.send(:prepend, MultiExtTemplateRenderer)

module ActionViewSinatra
  class MarkdownHandler
    class HTMLWithDivBrackets < Redcarpet::Render::HTML
      def preprocess(full_document)
        full_document.gsub(/```/, "```\n")
      end

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

    def self.call(template)
      @renderer ||= Redcarpet::Markdown.new(
        HTMLWithDivBrackets,
        autolink: true,
        tables: true,
        space_after_headers: true,
        fenced_code_blocks: true,
        lax_spacing: true
      )
      "#{@renderer.render(template.source).inspect}.html_safe"
    end
  end

  class Base < ActionView::Base
    def view(uri, locals={})
      render(partial: uri.to_s, locals: locals)
    end

    def params
      {}
    end

    def content_dir(*paths)
      File.join(pegasus_dir('sites.v3'), *paths)
    end

    def resolve_static(subdir, uri)
      @dirs.each do |dir|
        path = content_dir(dir, subdir, uri)
        if File.file?(path)
          return path
        end
      end
      nil
    end

    def resolve_image(uri)
      ['.png', '.jpeg', '.jpg', '.gif'].each do |extname|
        file_path = resolve_static('public', "#{uri}#{extname}")
        return file_path if file_path
      end
      nil
    end
  end

  # non-underscore-prefixed views
  ActionView::Resolver::Path.instance_eval do
    def build(name, prefix, partial)
      virtual = ""
      virtual << "#{prefix}/" unless prefix.empty?
      virtual << name
      new name, prefix, partial, virtual
    end
  end
end
