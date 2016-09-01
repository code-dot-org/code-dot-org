require 'test_helper'

class CloudfrontProxyTest < ActiveSupport::TestCase
  test 'RemoteIp understands cloudfront X-Forwarded-For header' do
    app = stub('app')

    remote_ip = ActionDispatch::RemoteIp.new(app, true, Dashboard::Application.config.action_dispatch.trusted_proxies)
    # 50.24.106.93 is the user's real address
    # 54.240.158.170 is cloudfront
    # 10.31.164.34 is the load balancer or something
    env = {'HTTP_X_FORWARDED_FOR' => '50.243.106.93, 54.240.158.170, 10.31.164.34',
           'REMOTE_IP' => '54.240.158.170'}

    # http://api.rubyonrails.org/classes/ActionDispatch/RemoteIp/GetIp.html
    req = ActionDispatch::Request.new env
    get_ip = ActionDispatch::RemoteIp::GetIp.new(req, remote_ip.check_ip, remote_ip.proxies)
    assert_equal '50.243.106.93', get_ip.calculate_ip
  end
end
