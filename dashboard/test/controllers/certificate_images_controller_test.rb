require 'test_helper'
require 'base64'

class CertificateImagesControllerTest < ActionController::TestCase
  test 'can show certificate image given name and course and donor' do
    data = {name: 'student', course: 'hourofcode', donor: 'Amazon'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show without student name' do
    data = {course: 'hourofcode', donor: 'Amazon'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show certificate without donor name' do
    data = {name: 'student', course: 'hourofcode'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'returns bad request given invalid donor name' do
    data = {name: 'student', course: 'hourofcode', donor: 'bogus'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :bad_request
    assert_includes response.body, 'invalid donor name'
  end

  test 'can show course1 course name' do
    data = {name: 'student', course: 'course1'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show coursea course name' do
    coursea = create :script, name: "coursea-2021", is_course: true
    create :course_version, content_root: coursea

    # stub the image, so that we can verify the params passed to create_course_certificate_image
    stub_path = dashboard_dir('app/assets/images/hour-of-code-logo.png')
    stub_image = Magick::Image.read(stub_path).first

    data = {name: 'student', course: 'coursea-2021'}
    filename = Base64.urlsafe_encode64(data.to_json)
    CertificateImage.expects(:create_course_certificate_image).with('student', 'coursea-2021', nil, "Course A (2021)").returns(stub_image).once
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show csp course name' do
    csp = create :unit_group, name: "csp-2021"
    create :course_version, content_root: csp

    # stub the image, so that we can verify the params passed to create_course_certificate_image
    stub_path = dashboard_dir('app/assets/images/hour-of-code-logo.png')
    stub_image = Magick::Image.read(stub_path).first

    data = {name: 'student', course: 'csp-2021'}
    filename = Base64.urlsafe_encode64(data.to_json)
    CertificateImage.expects(:create_course_certificate_image).with('student', 'csp-2021', nil, "Computer Science Principles ('21-'22)").returns(stub_image).once
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show accelerated course' do
    data = {name: 'student', course: 'accelerated'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show mee minecraft course' do
    data = {name: 'student', course: 'mee_timecraft'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end

  test 'can show bogus course name' do
    data = {name: 'student', course: 'bogus'}
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
