# A controller for proxying image and sound content so that it can be served
# without mixed-content warnings. The proxied content is intentionally given
# unlimited cache lifetime so users should ensure that media gets a distinct URL
# each time it changes. We assume the proxied content will be cached via a CDN
# to reduce the scale impact on Rails servers.
#
# To reduce the likelihood of abuse, the code only proxies content with an
# allowed whitelist of media types. We will need to monitor usage to detect
# abuse and potentially add other abuse prevention measures (e.g. a signature
# based on a secret.)

require 'set'

class MediaProxyController < ApplicationController
  include ProxyHelper

  # Content types that we are willing to proxy
  ALLOWED_CONTENT_TYPES = Set.new(
    ['image/bmp', 'image/x-windows-bmp', 'image/gif', 'image/jpeg', 'image/png',
     'image/svg+xml', 'audio/basic', 'audio/mid', 'audio/mpeg', 'audio/mp4',
     'audio/ogg', 'audio/vnd.wav'])

  # How long the content is allowed to be cached.
  EXPIRY_TIME = 10.years

  # Return the proxied media at the given URL.
  def get
    render_proxied_url(
        params[:u],
        allowed_content_types: ALLOWED_CONTENT_TYPES,
        allowed_hostname_suffixes: nil, # allow any hostname
        expiry_time: EXPIRY_TIME,
        infer_content_type: true)
  end
end
