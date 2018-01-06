require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)
require_relative '../../../shared/test/spy_newrelic_agent'
require 'test_helper'

class CurriculumProxyControllerTest < ActionController::TestCase
  test "should redirect from studio.code.org/docs path to docs.code.org path" do
    stub_request(:get, "https://docs.code.org/csd/maker_leds/index.html").
      to_return(body: 'docs.code.org content', headers: {})

    request.host = "studio.code.org"
    get :get_doc, params: {path: 'csd/maker_leds/index.html'}
    assert_response :success
    assert_equal response.body, 'docs.code.org content'
  end

  test "should redirect from studio.code.org/curriculum path to curriculum.code.org path" do
    stub_request(:get, "https://curriculum.code.org/csd/maker_leds/index.html").
      to_return(body: 'curriculum.code.org content', headers: {})

    request.host = "studio.code.org"
    get :get_curriculum, params: {path: 'csd/maker_leds/index.html'}
    assert_response :success
    assert_equal response.body, 'curriculum.code.org content'
  end
end
