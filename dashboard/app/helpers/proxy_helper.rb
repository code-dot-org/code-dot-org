require 'net/http'
require 'uri'

SSL_HOSTNAME_MISMATCH_REGEX = /does not match the server certificate/

# Helper which fetches the specified URL, optionally caching and following redirects.
module ProxyHelper
  DASHBOARD_IP_ADDRESS = IPAddr.new(IPSocket.getaddress(CDO.dashboard_hostname))

  def render_proxied_url(
    location,
    allowed_content_types:,
    allowed_hostname_suffixes:,
    expiry_time:,
    infer_content_type:,
    redirect_limit: 5,
    no_transform: false,
    headers: {}
  )
    if redirect_limit == 0
      render_error_response 500, 'Redirect loop'
      return
    end

    # Give up if the host doesn't respond within 3 seconds to avoid
    # tying up Rails thread.
    url = URI.parse(location)

    raise URI::InvalidURIError.new if url.host.nil? || url.port.nil?
    unless allowed_hostname?(url, allowed_hostname_suffixes) && allowed_ip_address?(url.host)
      render_error_response 400, "Hostname '#{url.host}' is not in the list of allowed hostnames. " \
          "The list of allowed hostname suffixes is: #{allowed_hostname_suffixes.join(', ')}. " \
          "If you wish to access a URL which is not currently allowed, please email support@code.org."
      return
    end
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = url.scheme == 'https'
    path = (url.path.empty?) ? '/' : url.path
    query = url.query || ''

    # Limit how long in seconds we're willing to wait.
    http.open_timeout = 3
    http.read_timeout = 3

    # Get the media.
    query_string = query.empty? ? '' : "?#{query}" # don't include the ? if the query is empty
    media = http.request_get(path + query_string, headers)

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
        redirect_limit: redirect_limit - 1
      )

    elsif !media.is_a? Net::HTTPSuccess
      # Pass through failure codes.
      render_error_response media.code, "Failed request #{media.code}"

    elsif allowed_content_types.try(:exclude?, media.content_type)
      # Reject disallowed content types.
      render_error_response 400, "Illegal content type #{media.content_type}"

    else
      # Proxy successful responses.
      expires_in expiry_time, public: true
      (response.cache_control[:extras] ||= []).push('no-transform') if no_transform
      send_data media.body, type: media.content_type, disposition: 'inline'
    end
  rescue URI::InvalidURIError
    render_error_response 400, "Invalid URI #{location}"
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET, Errno::ECONNREFUSED, Errno::ENETUNREACH => e
    render_error_response 400, "Network error #{e.class} #{e.message}"
  rescue OpenSSL::SSL::SSLError => e
    raise e unless e.message =~ SSL_HOSTNAME_MISMATCH_REGEX
    render_error_response 400, "Remote host SSL certificate error #{e.message}"
  end

  # Unlike render_proxied_url, this does not attempt to render the URL, but instead
  # just follows it to figure out what the redirected URL is. It's also the case
  # that we'll stop as soon as we've been redirected to a URL on this site.
  def resolve_redirect_url(location, allowed_hostname_suffixes:, redirect_limit: 5)
    if redirect_limit == 0
      return 500, 'Redirect loop'
    end

    url = URI.parse(location)
    raise URI::InvalidURIError.new if url.host.nil? || url.port.nil?

    # If we've resolved to a path on this host/port, stop trying to redirect
    if url.host === request.host && url.port === request.port
      return 200, location
    end

    # If hostname isn't in our white list, don't attempt a redirect
    unless allowed_hostname?(url, allowed_hostname_suffixes)
      return 200, location
    end

    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = url.scheme == 'https'
    path = (url.path.empty?) ? '/' : url.path
    query = url.query || ''

    # Limit how long in seconds we're willing to wait.
    http.open_timeout = 3
    http.read_timeout = 3

    # Get the response.
    response = http.request_head(path + '?' + query)

    if response.is_a? Net::HTTPRedirection
      resolve_redirect_url(response['location'], allowed_hostname_suffixes: allowed_hostname_suffixes, redirect_limit: redirect_limit - 1)
    else
      return response.code, response['location']
    end

  rescue URI::InvalidURIError
    return 400, "Invalid URI #{location}"
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET => e
    return 400, "Network error #{e.class} #{e.message}"
  end

  # Wrap constant in a method so it can be stubbed in a test.
  def dashboard_ip_address
    DASHBOARD_IP_ADDRESS
  end
  module_function :dashboard_ip_address

  private

  # Returns true if the url's hostname ends in one of the allowed suffixes.
  # If allowed_hostname_suffixes is nil, all hostnames are allowed.
  def allowed_hostname?(url, allowed_hostname_suffixes)
    return true unless allowed_hostname_suffixes
    return false unless url.hostname
    hostname = url.hostname.downcase
    allowed_hostname_suffixes.find do |suffix|
      hostname.match(Regexp.new("(^|\\.)#{Regexp.escape(suffix)}$"))
    end
  end

  # Renders an error response with the given HTTP status, setting headers to
  # ensure that the response will not be cached by clients or proxies.
  def render_error_response(status, text)
    prevent_caching
    render plain: text, status: status
  end

  # Do not permit proxying to a server on our own private network, unless it is our own dashboard IP Address (we
  # sometimes proxy to ourselves, which is an internal IP address on development / continuous integration environments).
  def allowed_ip_address?(hostname)
    host_ip_address = IPAddr.new(IPSocket.getaddress(hostname))
    public_ip_address?(host_ip_address) || host_ip_address == ProxyHelper.dashboard_ip_address
  end

  def public_ip_address?(ip_address)
    return (
      !ip_address.link_local? &&
      !ip_address.loopback? &&
      !ip_address.private? &&
      !IPAddr.new('0.0.0.0/8').include?(ip_address)
    )
  end
end
