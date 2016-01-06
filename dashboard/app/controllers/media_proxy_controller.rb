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
      render_error_response 500, 'Redirect loop'
      return
    end

    # Give up if the host doesn't respond within 3 seconds to avoid
    # tying up Rails thread.
    url = URI.parse(location)
    raise URI::InvalidURIError.new if url.host.nil? || url.port.nil?
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = url.scheme == 'https'
    path = (url.path.empty?) ? '/' : url.path

    # Limit how long we're willing to wait.
    http.open_timeout = 3
    http.read_timeout = 3

    # Get the media.
    media = http.request_get(path)

    # generate content-type from file name if we weren't given one
    if media.content_type.nil?
      media.content_type = Rack::Mime.mime_type(File.extname(path))
    end

    if media.kind_of? Net::HTTPRedirection
      # Follow up to five redirects.
      render_proxied_url(media['location'], redirect_limit - 1)

    elsif !media.kind_of? Net::HTTPSuccess
      # Pass through failure codes.
      render_error_response media.code, "Failed request #{media.code}"

    elsif !ALLOWED_CONTENT_TYPES.include?(media.content_type)
      # Reject disallowed content types.
      render_error_response 400, "Illegal content type #{media.content_type}"

    else
      # Proxy successful responses.
      expires_in EXPIRY_TIME, public: true
      send_data media.body, type: media.content_type, disposition: 'inline'
    end
  rescue URI::InvalidURIError
    render_error_response 400, "Invalid URI #{location}"
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET => e
    render_error_response 400, "Network error #{e.message}"
  end

  # Renders an error response with the given HTTP status, setting headers to
  # ensure that the response will not be cached by clients or proxies.
  def render_error_response(status, text)
    prevent_caching
    render text: text, status: status
  end

end
