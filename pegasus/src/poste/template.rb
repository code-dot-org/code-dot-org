require 'mail'
require_relative '../env'

module Poste

  class Template

    def initialize(body, engine=TextRender::MarkdownEngine)
      if match = body.match(/^---\s*\n(?<header>.*?\n?)^(---\s*$\n?)(?<html>\s*\n.*?\n?)^(---\s*$\n?)(?<text>\s*\n.*?\n?\z)/m)
        @header = TextRender::YamlEngine.new(match[:header].strip)
        @html = engine.new(match[:html].strip)
        @text = TextRender::ErbEngine.new(match[:text].strip)
      elsif match = body.match(/^---\s*\n(?<header>.*?\n?)^(---\s*$\n?)(?<html>\s*\n.*?\n?\z)/m)
        @header = TextRender::YamlEngine.new(match[:header].strip)
        @html = engine.new(match[:html].strip)
      else
        @html = engine.new(body.strip)
      end
    end

    def render(params={})
      if params.has_key?('form_id')
        form = Form.get(params['form_id'])
        params.merge! form.data
        params.merge! form.processed_data
        params['form'] = form
      end
      locals = OpenStruct.new(params).instance_eval{binding}

      header = @header.result(locals) unless @header.nil?
      html = @html.result(locals) unless @html.nil?
      text = @text.result(locals) unless @text.nil?

      [header, html, text]
    end

  end

end
