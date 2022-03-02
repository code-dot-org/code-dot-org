require 'test_helper'
require 'base64'

class CertificateImagesControllerTest < ActionController::TestCase
  test 'can show certificate image given name and course and donor' do
    data = {name: 'student', course: 'hourofcode', donor: 'Amazon'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'returns bad request without student name' do
    data = {course: 'hourofcode', donor: 'Amazon'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :bad_request
    assert_includes response.body, 'student name is required'
  end

  test 'returns bad request without donor name' do
    data = {name: 'student', course: 'hourofcode'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :bad_request
    assert_includes response.body, 'donor name is required'
  end

  test 'returns bad request given invalid donor name' do
    data = {name: 'student', course: 'hourofcode', donor: 'bogus'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :bad_request
    assert_includes response.body, 'invalid donor name'
  end

  test 'can show certificate image given bogus course name' do
    data = {name: 'student', course: 'bogus', donor: 'Amazon'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'returns bad request given invalid format' do
    data = {name: 'student', course: 'hourofcode', donor: 'Amazon'}
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
