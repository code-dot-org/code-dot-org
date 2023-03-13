require 'test_helper'
require 'base64'

class PrintCertificatesControllerTest < ActionController::TestCase
  test 'can show given name and course' do
    data = {name: 'student', course: 'hourofcode'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
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

  test 'batch shows multiple certificate images' do
    student_names = "Alice\nBob\nCharlie"
    post :batch, params: {studentNames: student_names}
    assert_response :success
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal 3, response_data['imageUrls'].length
    assert_includes response_data['imageUrls'].first, '/certificate_images/', 'certificate images must be customized'
  end

  test 'batch omits blank certificates' do
    student_names = "Alice\nBob\nCharlie\n\n"
    post :batch, params: {studentNames: student_names}
    assert_response :success
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal 3, response_data['imageUrls'].length
  end

  test 'batch shows at most 30 certificate images' do
    student_names = "Student\n" * 50
    post :batch, params: {studentNames: student_names}
    assert_response :success
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal 30, response_data['imageUrls'].length
  end
end
