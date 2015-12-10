# Trust Cloudfront proxies so we get real remote IPs

trusted_proxies = JSON.parse(IO.read(deploy_dir('lib/cdo/trusted_proxies.json')))['ranges'].map do |proxy|
  IPAddr.new(proxy)
end

Dashboard::Application.config.action_dispatch.trusted_proxies = ActionDispatch::RemoteIp::TRUSTED_PROXIES + trusted_proxies
