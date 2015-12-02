class ReadonlyTemplateController < ApplicationController
  layout false
  def index
    @app = params["app"]
    @js_locale = params["js_locale"]
  end
end
