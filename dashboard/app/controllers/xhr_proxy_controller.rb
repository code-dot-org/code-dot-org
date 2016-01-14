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

class XhrProxyController < ApplicationController
  include ProxyHelper

  ALLOWED_CONTENT_TYPES = Set.new(['application/javascript', 'text/html'])

  # How long the content is allowed to be cached
  EXPIRY_TIME = 1.minute

  # Return the proxied api at the given URL.
  def get
    render_proxied_url(params[:u], ALLOWED_CONTENT_TYPES, EXPIRY_TIME)
  end
end
