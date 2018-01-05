require 'net/http'
require 'set'

# This proxy controller allows us to serve curriculumn builder docs that live on
# [docs|curriculum].code.org as if they live on studio.code.org. This is done so that we can
# render them in an iframe, and access that iframe without having cross-origin problems
class CurriculumProxyController < ApplicationController
  include ProxyHelper

  EXPIRY_TIME = 30.minutes

  def get
    full_route = URI.parse(request.original_url).path
    if request.path.start_with?('/docs')
      # request.original_url will look something like https://studio.code.org/docs/csd/maker_leds/index.html
      # We want to redirect them to https://docs.code.org/csd/maker_leds/index.html
      redirect_route = full_route.sub(/^\/docs/, 'https://docs.code.org')
      allowed_hostname_suffixes = %w(
        docs.code.org
      )
    elsif request.path.start_with?('/curriculum')
      redirect_route = full_route.sub(/^\/curriculum/, 'https://curriculum.code.org')
      allowed_hostname_suffixes = %w(
        curriculum.code.org
      )
    else
      render_500
    end

    render_proxied_url(
      redirect_route,
      allowed_content_types: nil,
      allowed_hostname_suffixes: allowed_hostname_suffixes,
      expiry_time: EXPIRY_TIME,
      infer_content_type: true
    )
  end
end
