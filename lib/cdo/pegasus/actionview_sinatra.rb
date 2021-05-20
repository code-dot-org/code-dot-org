require 'action_view'
require 'cdo/markdown/handler'
require 'cdo/markdown/renderer'
require 'cdo/redcarpet/inline'
require 'haml'
require 'haml/template'
require 'redcarpet'
require 'sinatra/base'

module ActionViewSinatra
  class Base < ActionView::Base
    def initialize(sinatra, *args)
      @sinatra = sinatra
      super(*args)

      Cdo::Markdown::Handler.register(Cdo::Markdown::Renderer, Cdo::Markdown::Renderer::OPTIONS)
      Cdo::Markdown::Handler.register_html_safe(Redcarpet::Render::Safe)
      Cdo::Markdown::Handler.register_inline(Redcarpet::Render::Inline.new({filter_html: true}))
    end

    def response
      @sinatra.response
    end

    def params
      @sinatra.params || {}
    end

    # make locals hash directly accessible from templates; our old renderer
    # supported this and some templates rely on this functionality (see
    # views/pd_survey_controls/multi_select.haml for an example).
    #
    # TODO: update templates to no longer rely on this and remove.
    def locals
      @locals || {}
    end

    def render(options = {}, locals = {})
      # save locals hash for access by the locals method
      @locals = locals
      super(options, locals)
    rescue ActionView::Template::Error => e
      # allow templates to throw a Sinatra::NotFound error to trigger a 404
      raise e.cause if e.cause.is_a?(Sinatra::NotFound)
      raise e
    end

    # Our templates currently use a bunch of sinatra methods like resolve_static, redirect, etc.
    def method_missing(name, *args, &block)
      @sinatra.send(name, *args)
    end
  end
end
