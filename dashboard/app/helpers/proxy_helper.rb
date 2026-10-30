require 'net/http'
require 'uri'
require 'cdo/safe_http'

# Helper which fetches the specified URL, optionally caching and following redirects.
module ProxyHelper
  def render_proxied_url(
    location,
    allowed_content_types:,
    allowed_hostname_suffixes:,
    expiry_time:,
    infer_content_type:,
    redirect_limit: 5,
    no_transform: false
  )
    if redirect_limit == 0
      render_error_response 500, 'Redirect loop'
      return
    end

    # Give up if the host doesn't respond within 3 seconds to avoid
    # tying up Rails thread.
    url = URI.parse(location)

    raise URI::InvalidURIError.new if url.host.nil? || url.port.nil?

    resolved_ip_address = resolve_and_validate_ip_address(url.host)
    unless resolved_ip_address
      render_error_response 400, "Target IP address is restricted"
      return
    end

    unless allowed_hostname?(url, allowed_hostname_suffixes)
      render_error_response 400, "Hostname '#{url.host}' is not in the list of allowed hostnames. " \
          "The list of allowed hostname suffixes is: #{allowed_hostname_suffixes.join(', ')}. " \
          "If you wish to access a URL which is not currently allowed, please email support@code.org."
      return
    end

    http = SafeHttp.http_client(url, resolved_ip_address)
    media = http.request_get(SafeHttp.request_path(url))

    # generate content-type from file name if we weren't given one
    if media.content_type.nil?
      media.content_type = Rack::Mime.mime_type(File.extname(url.path))
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
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET, Errno::ECONNREFUSED, Errno::ENETUNREACH => exception
    render_error_response 400, "Network error #{exception.class} #{exception.message}"
  rescue OpenSSL::SSL::SSLError
    render_error_response 400, "Remote host SSL certificate error"
  rescue EOFError
    render_error_response 400, "Remote host closed the connection before sending all data"
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
    if url.host == request.host && url.port == request.port
      return 200, location
    end

    # If hostname isn't in our white list, don't attempt a redirect
    unless allowed_hostname?(url, allowed_hostname_suffixes)
      return 200, location
    end

    resolved_ip_address = resolve_and_validate_ip_address(url.host)
    unless resolved_ip_address
      return 400, "Target IP address is restricted"
    end

    http = SafeHttp.http_client(url, resolved_ip_address)
    response = http.request_head(SafeHttp.request_path(url))

    if response.is_a? Net::HTTPRedirection
      resolve_redirect_url(response['location'], allowed_hostname_suffixes: allowed_hostname_suffixes, redirect_limit: redirect_limit - 1)
    else
      return response.code, response['location']
    end
  rescue URI::InvalidURIError
    return 400, "Invalid URI #{location}"
  rescue SocketError, Net::OpenTimeout, Net::ReadTimeout, Errno::ECONNRESET => exception
    return 400, "Network error #{exception.class} #{exception.message}"
  end

  def dashboard_ip_address
    @@dashboard_ip_address ||= IPAddr.new(IPSocket.getaddress(CDO.dashboard_hostname))
  end
  module_function :dashboard_ip_address

  # Returns true if the url's hostname ends in one of the allowed suffixes.
  # If allowed_hostname_suffixes is nil, all hostnames are allowed.
  private def allowed_hostname?(url, allowed_hostname_suffixes)
    return true unless allowed_hostname_suffixes
    return false unless url.hostname
    hostname = url.hostname.downcase
    allowed_hostname_suffixes.find do |suffix|
      hostname.match(Regexp.new("(^|\\.)#{Regexp.escape(suffix)}$"))
    end
  end

  # Renders an error response with the given HTTP status, setting headers to
  # ensure that the response will not be cached by clients or proxies.
  private def render_error_response(status, text)
    prevent_caching
    render plain: text, status: status
  end

  private def resolve_and_validate_ip_address(hostname)
    SafeHttp.resolved_ip_address(hostname, allow_ips: [ProxyHelper.dashboard_ip_address])
  end

  private def allowed_ip_address?(hostname)
    !resolve_and_validate_ip_address(hostname).nil?
  end
end
