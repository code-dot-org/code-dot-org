require 'test_helper'
require 'base64'

class CertificatesControllerTest < ActionController::TestCase
  test 'can show given name and course' do
    data = {name: 'student', course: 'hourofcode'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
    assert_equal "max-age=0, private, must-revalidate, no-store", @response.headers["Cache-Control"]
  end

  test 'can show given bogus course' do
    data = {name: 'student', course: 'bogus'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
  end

  test 'can show without name or course' do
    data = {}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
  end

  test 'returns bad request given invalid base64' do
    get :show, params: {encoded_params: 'bogus'}
    assert_response :bad_request
    assert_includes response.body, 'invalid base64'
  end
end
