require 'test_helper'
require 'base64'

class CertificateImagesControllerTest < ActionController::TestCase
  test 'can show certificate image given name and course' do
    data = {name: 'student', course: 'hourofcode'}
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
  end

  test 'returns bad request given invalid base64' do
    get :show, format: 'jpg', params: {filename: 'bogus'}
    assert_response :bad_request
  end
end
