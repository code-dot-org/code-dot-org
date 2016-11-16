require 'set'

class RedirectProxyController < ApplicationController
  include ProxyHelper

  # Returns a (potentially) redirected url of the given url
  def get
    url = params[:u]
    status, result = resolve_redirect_url(url)

    if status == 200
      render json: result, status: status
    else
      render status: status
    end
  end
end
