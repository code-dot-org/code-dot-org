require 'set'

class RedirectProxyController < ApplicationController
  include ProxyHelper

  ALLOWED_HOSTNAME_SUFFIXES = %w(
    bit.ly
    ow.ly
    t.co
    tinyurl.com
    tr.im
    goo.gl
  ).freeze

  # Returns a (potentially) redirected url of the given url
  def get
    url = params[:u]
    status, result = resolve_redirect_url(url, allowed_hostname_suffixes: ALLOWED_HOSTNAME_SUFFIXES)

    if status == 200
      render plain: result, status: status
    else
      render plain: '', status: status
    end
  end
end
