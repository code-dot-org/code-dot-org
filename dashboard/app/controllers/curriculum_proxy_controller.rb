require 'net/http'
require 'set'

# This proxy controller allows us to serve curriculum builder docs that live on
# [docs|curriculum].code.org as if they live on studio.code.org. This is done so that we can
# render them in an iframe, and access that iframe without having cross-origin problems.
class CurriculumProxyController < ApplicationController
  include ProxyHelper

  EXPIRY_TIME = 30.minutes

  # Proxy from studio.code.org/docs/ to curriculum.code.org/docs
  def get_doc_landing
    render_proxied_url(
      'https://curriculum.code.org/docs/',
      allowed_content_types: nil,
      allowed_hostname_suffixes: %w(curriculum.code.org),
      expiry_time: EXPIRY_TIME,
      infer_content_type: true
    )
  end

  # Proxy from studio.code.org/docs/foo to curriculum.code.org/docs/foo
  def get_doc
    render_proxied_url(
      URI.parse(request.original_url).path.sub(/^\/docs/, 'https://curriculum.code.org/docs'),
      allowed_content_types: nil,
      allowed_hostname_suffixes: %w(curriculum.code.org),
      expiry_time: EXPIRY_TIME,
      infer_content_type: true
    )
  end

  # Proxy from studio.code.org/curriculum/foo to curriculum.code.org/foo
  def get_curriculum
    render_proxied_url(
      URI.parse(request.original_url).path.sub(/^\/curriculum/, 'https://curriculum.code.org'),
      allowed_content_types: nil,
      allowed_hostname_suffixes: %w(curriculum.code.org),
      expiry_time: EXPIRY_TIME,
      infer_content_type: true
    )
  end
end
