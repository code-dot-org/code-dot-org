# A controller for proxying web requests to 3rd party APIs. This protects
# applab users from XSS attacks, complies with the Same Origin Policy,
# and prevents http/https mismatch warnings in IE.
#
# Responses are cached for one minute since many 3rd party APIs serve data
# which changes frequently such as news or sports scores.
#
# To reduce the likelihood of abuse, we only proxy content with an allowed
# whitelist of media types. We will need to monitor usage to detect
# abuse and potentially add other abuse prevention measures.

require 'set'
require 'cdo/newrelic'

class XhrProxyController < ApplicationController
  include ProxyHelper

  ALLOWED_CONTENT_TYPES = Set.new(['application/json'])

  # How long the content is allowed to be cached
  EXPIRY_TIME = 1.minute

  # Return the proxied api at the given URL.
  def get
    channel_id = params[:c]
    url = params[:u]

    begin
      owner_storage_id, _ = storage_decrypt_channel_id channel_id
    rescue Exception => e
      raise "XhrProxyController request with invalid channel_id: '#{channel_id}' for url: '#{url}' exception: #{e.message}"
    end

    event_details = {
        channel_id: channel_id,
        owner_storage_id: owner_storage_id,
        url: url
    }
    NewRelic::Agent.record_custom_event("XhrProxyControllerRequest", event_details) if CDO.newrelic_logging
    Rails.logger.info "XhrProxyControllerRequest #{event_details}"

    render_proxied_url(
        url,
        allowed_content_types: ALLOWED_CONTENT_TYPES,
        expiry_time: EXPIRY_TIME,
        infer_content_type: false)
  end
end
