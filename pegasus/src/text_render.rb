require 'erb'
require 'ostruct'
require 'redcarpet'
require 'yaml'

module TextRender
  class Locals
    def initialize(locals={})
      @locals = locals
      @base = OpenStruct.new(@locals)
    end

    def method_missing(method, *args, &block)
      @base.send(method, *args, &block)
    end

    def avatar_image(name)
      basename = name.downcase.gsub(/\W/, '_').gsub(/_+/, '_')

      search_bases = []
      search_bases << sites_dir(@locals[:request].site, 'images', 'avatars', basename) if @locals.key?(:request)
      search_bases << sites_dir('all', 'images', 'avatars', basename)

      search_extnames = ['.png', '.jpeg', '.jpg', '.gif']

      path = FileUtility.find_first_existing(String.multiply_concat(search_bases, search_extnames))
      return nil if path.nil?

      "/images/fit-320/avatars/#{File.basename(path)}"
    end

    def partial(uri, locals={})
      locals = @locals.merge(locals)

      search_bases = []
      search_bases << File.join(locals[:partials_dir], uri) if locals.key?(:partials_dir)
      search_bases << sites_dir(locals[:request].site, 'views', uri) if locals.key?(:request)
      search_bases << sites_dir('all', 'views', uri)

      search_extnames = ['.haml', '.html', '.md', '.txt']

      path = FileUtility.find_first_existing(String.multiply_concat(search_bases, search_extnames))
      return "Partial not found: '#{uri}'" if path.nil?

      TextRender.file(path, locals)
    end
  end

  def self.r(engine, template, locals={})
    engine.new(template).result(Locals.new(locals).instance_eval {binding})
  end

  def self.f(engine, path, locals={})
    r(engine, IO.read(path), locals)
  end

  #
  # ERB
  #
  class ErbEngine
    def initialize(template)
      @engine = ERB.new(template)
    end

    def result(binding=nil)
      @engine.result(binding)
    end
  end

  def self.erb(s, locals={})
    r(ErbEngine, s, locals)
  end

  def self.erb_file(path, locals={})
    f(ErbEngine, path, locals)
  end

  #
  # Haml
  #
  class HamlEngine
    def initialize(template)
      # Lazily require haml here because requiring it at the top has some
      # potential unwanted side effects.
      #
      # Specifically, when haml is loaded it check to see if Rails is also in
      # the environment:
      # https://github.com/haml/haml/blob/9be4e1fd86a5086ba234053f5c21eeece39af681/lib/haml.rb#L25
      # If it doesn't find rails, it doesn't initialize Haml::Template, which
      # means that when we _do_ initialize rails, things will break.
      #
      # Loading haml here rather than at the top of the file will help make
      # sure that this file doesn't accidentally try to load haml too early in
      # the initialization process.
      require 'haml'
      @engine = Haml::Engine.new(template)
    end

    def result(binding=nil)
      @engine.render(binding)
    end
  end

  def self.haml(s, locals={})
    r(HamlEngine, s, locals)
  end

  def self.haml_file(path, locals={})
    f(HamlEngine, path, locals)
  end

  #
  # Markdown
  #
  class MarkdownEngine
    class HTMLWithDivBrackets < Redcarpet::Render::HTML
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

    class HTMLWithTags < HTMLWithDivBrackets
      def preprocess(full_document)
        wrap_details_tags_in_divs(full_document)
      end

      private

      def wrap_details_tags_in_divs(full_document)
        full_document.
            gsub(/<details>/, "\n<div><details>").
            gsub(/<\/details>/, "</details></div>\n")
      end
    end

    def initialize(template)
      @template = ErbEngine.new(template)
      @engine = Redcarpet::Markdown.new(
        HTMLWithTags,
        autolink: true,
        tables: true,
        space_after_headers: true
      )
    end

    def result(binding=nil)
      @engine.render(@template.result(binding))
    end
  end

  def self.markdown(s, locals={})
    r(MarkdownEngine, s, locals)
  end

  def self.markdown_file(path, locals={})
    f(MarkdownEngine, path, locals)
  end

  #
  # SafeMarkdown
  #
  class SafeMarkdownEngine
    def initialize(template)
      @template = ErbEngine.new(template)
      @engine = Redcarpet::Markdown.new(
        Redcarpet::Render::Safe,
        autolink: true,
        tables: true,
        space_after_headers: true,
      )
    end

    def result(binding=nil)
      @engine.render(@template.result(binding))
    end
  end

  def self.safe_markdown(s, locals={})
    r(SafeMarkdownEngine, s, locals)
  end

  #
  # Yaml
  #
  class YamlEngine
    def initialize(template)
      @template = ErbEngine.new(template)
    end

    def result(binding=nil)
      YAML.load(@template.result(binding))
    end
  end

  def self.yaml(s, locals={})
    r(YamlEngine, s, locals)
  end

  #
  # General
  #
  def self.file(path, locals={})
    engine = {
      '.haml' => HamlEngine,
      '.html' => ErbEngine,
      '.md' => MarkdownEngine,
      '.txt' => MarkdownEngine,
      '.yml' => YamlEngine,
    }[File.extname(path).downcase]
    f(engine, path, locals)
  end
end
