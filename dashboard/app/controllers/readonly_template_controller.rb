class ReadonlyTemplateController < ApplicationController
  layout false
  def index
    @app = params["app"]
    @js_locale = params["js_locale"]
    @locale_dir = params["locale_dir"]
  end
end
