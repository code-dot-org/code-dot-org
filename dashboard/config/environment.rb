# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Force UTF-8 Encodings.
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

# Initialize the Rails application.
Dashboard::Application.initialize!

Dashboard::Application.configure do

  # By default, Rails applies a SAMEORIGIN policy to iframes (ie. only Code.org pages can
  # frame our content.)  If the CDO.allowed_iframe_ancestors configuration variable is
  # defined, override that policy allow the specified source list (as described in
  # http://w3c.github.io/webappsec-csp/#source-lists) to frame our content.
  if CDO.allowed_iframe_ancestors
    iframe_policy = "frame-ancestors 'self' #{CDO.allowed_iframe_ancestors}"
    config.action_dispatch.default_headers['Content-Security-Policy'] = iframe_policy
    config.action_dispatch.default_headers['X-Content-Security-Policy'] = iframe_policy

    # Clear the older X-Frame-Options header because it doesn't support multiple
    # domains. (Contrary to the spec, on Chrome the X-Frame-Options header takes
    # priority over Content-Security-Policy.)
    config.action_dispatch.default_headers['X-Frame-Options'] = ''
  end
end
