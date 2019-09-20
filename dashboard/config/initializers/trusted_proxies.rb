# Trust Cloudfront proxies so we get real remote IPs
require 'cdo/trusted_proxies'

trusted_proxies = TrustedProxies.get_from_s3

Dashboard::Application.config.action_dispatch.trusted_proxies = ActionDispatch::RemoteIp::TRUSTED_PROXIES + trusted_proxies
