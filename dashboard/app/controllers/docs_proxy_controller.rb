require 'net/http'
require 'set'

# This proxy controller allows us to serve curriculumn builder docs that live on
# docs.code.org as if they live on studio.code.org. This is done so that we can
# render them in an iframe, and access that iframe without having cross-origin problems
class DocsProxyController < ApplicationController
  include ProxyHelper

  ALLOWED_HOSTNAME_SUFFIXES = %w(
    docs.code.org
  )

  EXPIRY_TIME = 30.minutes

  def get
    # request.original_url will look something like http://studio.code.org/docs/csd/maker_leds/index.html
    # We want to redirect them to https://docs.code.org/csd/maker_leds/index.html
    docs_route = request.original_url.split('docs')[1..-1].join

    render_proxied_url(
      "https://docs.code.org#{docs_route}",
      allowed_content_types: nil,
      allowed_hostname_suffixes: ALLOWED_HOSTNAME_SUFFIXES,
      expiry_time: EXPIRY_TIME,
      infer_content_type: true
    )
  end
end
