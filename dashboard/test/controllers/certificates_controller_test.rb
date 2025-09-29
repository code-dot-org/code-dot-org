require 'test_helper'
require 'base64'

class CertificatesControllerTest < ActionController::TestCase
  setup_all do
    @teacher = create(:teacher)
    @teacher.freeze
  end

  before do
    CDO.stubs(:default_scheme).returns('http:')
  end

  test 'can show given name and course' do
    data = {name: 'student', course: 'hourofcode'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_match %r{^/certificate_images/}, response_data['imageUrl']
  end

  test 'can show given bogus course' do
    data = {name: 'student', course: 'bogus'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_match %r{^/certificate_images/}, response_data['imageUrl']
  end

  test 'can show without name or course' do
    data = {}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
    expected_image_url = 'http://test-studio.code.org/blockly/media/certificates/hour_of_code_certificate.jpg'
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal expected_image_url, response_data['imageUrl']
  end

  test 'shows static image for unpersonalized hoc course' do
    data = {course: 'mc'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
    expected_image_url = 'http://test-studio.code.org/blockly/media/certificates/MC_Hour_Of_Code_Certificate.png'
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal expected_image_url, response_data['imageUrl']
  end

  test 'shows custom image for unpersonalized csf course' do
    unit = create(:unit, name: 'course1')
    unit_group = create(:single_unit_course, :stable, unit: unit, name: 'course1')
    CourseOffering.add_course_offering(unit_group)
    data = {course: 'course1'}
    encoded_params = Base64.urlsafe_encode64(data.to_json)
    get :show, params: {encoded_params: encoded_params}
    assert_response :success
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_match %r{^/certificate_images/}, response_data['imageUrl']
  end

  test 'returns bad request given invalid base64' do
    get :show, params: {encoded_params: 'bogus'}
    assert_response :bad_request
    assert_includes response.body, 'invalid base64'
  end

  test 'shows static image for blank certificate' do
    get :blank
    assert_response :success
    expected_image_url = 'http://test-studio.code.org/blockly/media/certificates/hour_of_code_certificate.jpg'
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal expected_image_url, response_data['imageUrl']
  end

  test_user_gets_response_for :batch, user: nil, response: :success
  test_user_gets_response_for :batch, user: :student, response: :redirect, redirected_to: '/'
  test_user_gets_response_for :batch, user: :teacher, response: :success

  test 'batch page loads hoc image by default' do
    sign_in @teacher
    get :batch
    assert_response :success
    expected_image_url = 'http://test-studio.code.org/blockly/media/certificates/hour_of_code_certificate.jpg'
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal 'hourofcode', response_data['courseName']
    assert_equal expected_image_url, response_data['imageUrl']
  end

  test 'batch page loads custom image for oceans course' do
    oceans = create(:script, name: 'oceans')
    oceans_course = create(:single_unit_course, unit: oceans, name: 'oceans')
    create(:course_version, content_root: oceans_course)

    sign_in @teacher
    encoded_course_name = Base64.urlsafe_encode64('oceans')
    get :batch, params: {course: encoded_course_name}
    assert_response :success
    expected_image_url = 'http://test-studio.code.org/blockly/media/certificates/oceans_hoc_certificate.png'
    response_data = JSON.parse(css_select('script[data-certificate]').first.attribute('data-certificate').to_s)
    assert_equal 'oceans', response_data['courseName']
    assert_equal expected_image_url, response_data['imageUrl']
  end
end
