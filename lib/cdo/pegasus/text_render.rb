require 'erb'
require 'haml'
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
      search_bases << sites_dir(@locals[:request].site, 'images', 'avatars', basename) if @locals.has_key?(:request)
      search_bases << sites_dir('all', 'images', 'avatars', basename)

      search_extnames = ['.png','.jpeg','.jpg','.gif']

      path = File.find_first_existing(String.multiply_concat(search_bases, search_extnames))
      return nil if path.nil?

      "/images/fit-320/avatars/#{File.basename(path)}"
    end

    def partial(uri, locals={})
      locals = @locals.merge(locals)

      search_bases = []
      search_bases << File.join(locals[:partials_dir], uri) if locals.has_key?(:partials_dir)
      search_bases << sites_dir(locals[:request].site, 'views', uri) if locals.has_key?(:request)
      search_bases << sites_dir('all', 'views', uri)

      search_extnames = ['.haml', '.html', '.md', '.txt']

      path = File.find_first_existing(String.multiply_concat(search_bases,search_extnames))
      return "Partial not found: '#{uri}'" if path.nil?

      TextRender.file(path, locals)
    end
  end

  def self.r(engine,template,locals={})
    engine.new(template).result(Locals.new(locals).instance_eval{binding})
  end

  def self.f(engine,path,locals={})
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

    class HTMLWithTags < Redcarpet::Render::HTML
      def postprocess(full_document)
        full_document.gsub!(/<p>\[\/(.*)\]<\/p>/) do
          "</div>"
        end
        full_document.gsub!(/<p>\[(.*)\]<\/p>/) do
          value = $1
          if value[0] == '#'
            attribute = 'id'
            value = value[1..-1]
          else
            attribute = 'class'
          end

          "<div #{attribute}='#{value}'>"
        end
        full_document
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
  def self.file(path,locals={})
    engine = {
      '.haml'=>HamlEngine,
      '.html'=>ErbEngine,
      '.md'=>MarkdownEngine,
      '.txt'=>MarkdownEngine,
      '.yml'=>YamlEngine,
    }[File.extname(path).downcase]
    f(engine, path, locals)
  end
end
