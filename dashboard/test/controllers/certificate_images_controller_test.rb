require 'test_helper'
require 'base64'

class CertificateImagesControllerTest < ActionController::TestCase
  test 'can show certificate image given name and course' do
    data = {name: 'student', course: 'hourofcode'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
    assert_equal "max-age=0, private, must-revalidate, no-store", @response.headers["Cache-Control"]
  end

  test 'can show certificate image given bogus course name' do
    data = {name: 'student', course: 'bogus'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show certificate image without name or course' do
    data = {}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'returns bad request given invalid format' do
    data = {name: 'student', course: 'hourofcode'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'bogus', params: {filename: filename}
    assert_response :bad_request
    assert_includes response.body, 'invalid format'
  end

  test 'returns bad request given invalid base64' do
    get :show, format: 'jpg', params: {filename: 'bogus'}
    assert_response :bad_request
    assert_includes response.body, 'invalid base64'
  end
end
