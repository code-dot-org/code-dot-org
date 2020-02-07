require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)
require_relative '../../../shared/test/spy_newrelic_agent'
require 'test_helper'

class CurriculumProxyControllerTest < ActionController::TestCase
  test "should redirect from studio.code.org/docs to curriculum.code.org/docs" do
    stub_request(:get, "https://curriculum.code.org/docs/").
        to_return(body: 'curriculum.code.org/docs content', headers: {})

    request.host = "studio.code.org"
    get :get_doc_landing
    assert_response :success
    assert_equal response.body, 'curriculum.code.org/docs content'
  end

  test "should redirect from studio.code.org/docs path to curriculum.code.org/docs path" do
    stub_request(:get, "https://curriculum.code.org/docs/concepts/game-lab/drawing-shapes/").
        to_return(body: 'curriculum.code.org content', headers: {})

    request.host = "studio.code.org"
    get :get_doc, params: {path: 'concepts/game-lab/drawing-shapes/'}
    assert_response :success
    assert_equal response.body, 'curriculum.code.org content'
  end

  test "should redirect from studio.code.org/curriculum path to curriculum.code.org path" do
    stub_request(:get, "https://curriculum.code.org/csf-18/coursea/1/").
      to_return(body: 'curriculum.code.org content', headers: {})

    request.host = "studio.code.org"
    get :get_curriculum, params: {path: 'csf-18/coursea/1/'}
    assert_response :success
    assert_equal response.body, 'curriculum.code.org content'
  end
end
