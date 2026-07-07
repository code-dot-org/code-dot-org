# A controller for proxying web requests to 3rd party APIs. This protects
# applab users from XSS attacks, complies with the Same Origin Policy,
# and prevents http/https mismatch warnings in IE.
#
# Responses are cached for one minute since many 3rd party APIs serve data
# which changes frequently such as news or sports scores.
#
# To reduce the likelihood of abuse, we only proxy content with an allowed
# list of JSON response types. We will need to monitor usage to detect
# abuse and potentially add other abuse prevention measures.

require 'set'
require 'cdo/shared_constants'

class XhrProxyController < ApplicationController
  include ProxyHelper
  include SharedConstants

  ALLOWED_CONTENT_TYPES = Set.new(
    %w(
      application/json
      application/geo+json
      application/vnd.api+json
      text/javascript
      text/json
      text/plain
    )
  ).freeze

  # How long the content is allowed to be cached
  EXPIRY_TIME = 1.minute.freeze

  # Return the proxied api at the URL specified in the 'u' parameter. The 'c' parameter
  # is an unforgeable token which identifies the app lab app which is generating the request,
  # and may be used to enforce a per-app rate-limit.
  def get
    allow_pyodide_sandbox_cors

    channel_id = params[:c]
    url = params[:u]

    begin
      owner_storage_id, _ = get_storage_id_and_project_id(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError => exception
      render_error_response 403, "Invalid token: '#{channel_id}' for url: '#{url}' exception: #{exception.message}"
      return
    end

    span = OpenTelemetry::Trace.current_span
    span.set_attribute('XhrProxyControllerRequest', true)
    span.set_attribute('XhrProxyControllerRequest.channel_id', channel_id)
    span.set_attribute('XhrProxyControllerRequest.owner_storage_id', owner_storage_id)
    span.set_attribute('XhrProxyControllerRequest.url', url)
    Rails.logger.info "XhrProxyControllerRequest channel_id=#{channel_id} owner_storage_id=#{owner_storage_id} url=#{url}"

    render_proxied_url(
      url,
      allowed_content_types: ALLOWED_CONTENT_TYPES,
      allowed_hostname_suffixes: ALLOWED_HOSTNAME_SUFFIXES,
      expiry_time: EXPIRY_TIME,
      infer_content_type: false,
    )
  end

  private def allow_pyodide_sandbox_cors
    preview_host = CDO.preview_codeprojects_hostname
    return if preview_host.blank?

    # Lets the isolated pyodide sandbox (see PyodideSandboxController) call this
    # endpoint cross-origin for requests.get() support (CT-537). No credentials are
    # involved -- this endpoint authorizes via the unforgeable channel_id token above,
    # not cookies -- so allowing just this one origin to read the response is safe.
    sandbox_regex = %r{\Ahttps?://pyodide-sandbox\.#{Regexp.escape(preview_host)}(:\d+)?\z}
    if request.origin&.match?(sandbox_regex)
      response.headers['Access-Control-Allow-Origin'] = request.origin
    end
  end
end
