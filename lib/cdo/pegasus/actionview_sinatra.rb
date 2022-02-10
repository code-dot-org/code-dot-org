require 'action_view'
require 'cdo/markdown/handler'
require 'cdo/markdown/renderer'
require 'cdo/redcarpet/inline'
require 'haml'
require 'haml/template'
require 'redcarpet'
require 'sinatra/base'

# Helper module to allow us to use ActionView's template rendering
# functionality within the context of Sinatra.
module ActionViewSinatra
  # Factory method to accommodate the complex initialization logic required.
  # ActionView itself (as of Rails 6) includes some template caching
  # protections which require it to be initialized via the
  # `with_empty_template_cache` factory method, and our own modifications
  # require us to set an instance variable on the resulting object. So we
  # simply call the Rails 6 factory, then manually set our instance variable.
  def self.create_view(sinatra)
    # Rails 6 added the `with_empty_template_cache` method and some new
    # initialization logic that requires us to use it rather than instantiating
    # directly. To provide support for both Rails 5 and 6, we conditionally
    # invoke that pathway.
    # Once we have fully upgraded to Rails 6, this can be simplified.
    view = ActionViewSinatra::Base.respond_to?(:with_empty_template_cache) ?
      ActionViewSinatra::Base.with_empty_template_cache.empty :
      ActionViewSinatra::Base.new
    view.set_sinatra(sinatra)
    view
  end

  class Base < ActionView::Base
    def initialize(*args)
      super

      Cdo::Markdown::Handler.register(Cdo::Markdown::Renderer, Cdo::Markdown::Renderer::OPTIONS)
      Cdo::Markdown::Handler.register_html_safe(Redcarpet::Render::Safe)
      Cdo::Markdown::Handler.register_inline(Redcarpet::Render::Inline.new({filter_html: true}))
    end

    def set_sinatra(sinatra)
      @sinatra = sinatra
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
