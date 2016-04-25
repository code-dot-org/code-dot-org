require 'net/http'
require 'uri'

# Helper which fetches the specified URL, optionally caching and following redirects.
module ProxyHelper
  def render_proxied_url(location, allowed_content_types:, allowed_hostname_suffixes:, expiry_time:, infer_content_type:, redirect_limit: 5)
    if redirect_limit == 0
      render_error_response 500, 'Redirect loop'
      return
    end

    # Give up if the host doesn't respond within 3 seconds to avoid
    # tying up Rails thread.
    url = URI.parse(location)

    raise URI::InvalidURIError.new if url.host.nil? || url.port.nil?
    if !allowed_hostname?(url, allowed_hostname_suffixes)
      render_error_response 400, "Hostname '#{url.host}' is not in the list of allowed hostnames. " \
          "The list of allowed hostname suffixes is: #{allowed_hostname_suffixes.join(', ')}. " \
          "If you wish to access a URL which is not currently allowed, please email support@code.org."
      return
    end
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = url.scheme == 'https'
    path = (url.path.empty?) ? '/' : url.path
    query = url.query || ''

    # Limit how long we're willing to wait.
    http.open_timeout = 3
    http.read_timeout = 3

    # Get the media.
    media = http.request_get(path + '?' + query)

    # generate content-type from file name if we weren't given one
    if media.content_type.nil?
      media.content_type = Rack::Mime.mime_type(File.extname(path))
    end

    if media.is_a? Net::HTTPRedirection
      # Follow up to five redirects.
      render_proxied_url(
          media['location'],
          allowed_content_types: allowed_content_types,
          allowed_hostname_suffixes: allowed_hostname_suffixes,
          expiry_time: expiry_time,
          infer_content_type: infer_content_type,
          redirect_limit: redirect_limit - 1)

    elsif !media.is_a? Net::HTTPSuccess
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

  # Returns true if the url's hostname ends in one of the allowed suffixes.
  # If allowed_hostname_suffixes is nil, all hostnames are allowed.
  def allowed_hostname?(url, allowed_hostname_suffixes)
    return true unless allowed_hostname_suffixes
    return false unless url.hostname

    allowed_hostname_suffixes.find do |suffix|
      url.hostname.downcase.match(Regexp.new("#{Regexp.escape(suffix)}$"))
    end
  end

  # Renders an error response with the given HTTP status, setting headers to
  # ensure that the response will not be cached by clients or proxies.
  def render_error_response(status, text)
    prevent_caching
    render text: text, status: status
  end
end
