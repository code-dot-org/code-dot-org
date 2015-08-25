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

require 'net/http'
require 'set'
require 'uri'

class MediaProxyController < ApplicationController

  # Content types that we are willing to proxy
  ALLOWED_CONTENT_TYPES = Set.new(
    ['image/bmp', 'image/x-windows-bmp', 'image/gif', 'image/jpeg', 'image/png',
     'image/svg+xml', 'audio/basic', 'audio/mid', 'audio/mpeg', 'audio/mp4',
     'audio/ogg', 'audio/vnd.wav'])

  # How long the content is allowed to be cached.
  EXPIRY_TIME = 10.years

  # Return the proxied media at the given URL.
  def get
    render_proxied_url(params[:u])
  end

  private
  def render_proxied_url(location, redirect_limit = 5)
    if redirect_limit == 0
      render text: 'Redirect loop', status: 500
      return
    end

    # Give up if the host doesn't respond within 3 seconds to avoid
    # tying up Rails thread.
    url = URI.parse(location)
    http = Net::HTTP.new(url.host, url.port)
    path = (url.path.empty?) ? '/' : url.path

    # Limit how long we're willing to wait.
    http.open_timeout = 3
    http.read_timeout = 3

    # Get the resource, following up to five redirects.
    media = http.request_get(path)
    if media.kind_of? Net::HTTPRedirection
      render_proxied_url(media['location'], redirect_limit - 1)
      return
    end

    if !media.kind_of? Net::HTTPSuccess
      render text: "Failed request #{media.code}", status: media.code
    elsif !ALLOWED_CONTENT_TYPES.include?(media.content_type)
      render text: "Illegal content type #{media.content_type}", status: 400
    else
      expires_in EXPIRY_TIME, public: true
      send_data media.body, type: media.content_type, disposition: 'inline'
    end
  rescue URI::InvalidURIError
    render text: 'Invalid URI', status: 400
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET => e
    render text: "Network error #{e.message}", status: 500
  end

end
