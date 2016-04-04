require 'net/http'
require 'uri'

module ProxyHelper
  def render_proxied_url(location, allowed_content_types:, expiry_time:, infer_content_type:, redirect_limit: 5)
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
    uri = url.request_uri.empty? ? '/' : url.request_uri
    query = url.query  || ''

    # Limit how long we're willing to wait.
    http.open_timeout = 3
    http.read_timeout = 3

    # Get the media.
    media = http.request_get(uri + '?' + query)

    # generate content-type from file name if we weren't given one
    if media.content_type.nil? && infer_content_type
      media.content_type = Rack::Mime.mime_type(File.extname(url.path))
    end

    if media.kind_of? Net::HTTPRedirection
      # Follow up to five redirects.
      render_proxied_url(
          media['location'],
          allowed_content_types: allowed_content_types,
          expiry_time: expiry_time,
          infer_content_type: infer_content_type,
          redirect_limit: redirect_limit - 1)

    elsif !media.kind_of? Net::HTTPSuccess
      # Pass through failure codes.
      render_error_response media.code, "Failed request #{media.code}"

    elsif !allowed_content_types.include?(media.content_type)
      # Reject disallowed content types.
      render_error_response 400, "Illegal content type #{media.content_type}"

    else
      # Proxy successful responses.
      expires_in expiry_time, public: true
      send_data media.body, type: media.content_type, disposition: 'inline'
    end
  rescue URI::InvalidURIError
    render_error_response 400, "Invalid URI #{location}"
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET => e
    render_error_response 400, "Network error #{e.class} #{e.message}"
  end

  private

  # Renders an error response with the given HTTP status, setting headers to
  # ensure that the response will not be cached by clients or proxies.
  def render_error_response(status, text)
    prevent_caching
    render text: text, status: status
  end
end
