require 'test_helper'
require 'base64'

class Api::V1::CertificatesControllerTest < ActionController::TestCase
  test 'congrats does not require sign-in' do
    hoc_course = create(:hoc_course)

    get :congrats, params: {s: Base64.urlsafe_encode64(hoc_course.name)}
    assert_response :success
    assert_equal 'private, no-store', response.headers['Cache-Control']

    body = JSON.parse(response.body)
    assert_equal 1, body['certificates'].length
    assert_equal hoc_course.name, body['certificates'][0]['courseName']
    assert_nil body['userName']
    assert_equal false, body['under13']
    assert_nil body['userType']
    assert_predicate body['csrfToken'], :present?
    assert_predicate session[:statsig_stable_id], :present?
  end

  test 'user_info returns only user and CSRF fields without public caching' do
    teacher = create(:teacher)
    sign_in teacher

    get :user_info

    assert_response :success
    assert_equal 'private, no-store', response.headers['Cache-Control']
    assert_equal %w[csrfToken under13 userName userType], JSON.parse(response.body).keys.sort

    body = JSON.parse(response.body)
    assert_equal teacher.name, body['userName']
    assert_equal false, body['under13']
    assert_equal 'teacher', body['userType']
    assert_predicate body['csrfToken'], :present?
  end

  test 'congrats carries signed-in teacher fields' do
    teacher = create(:teacher)
    sign_in teacher

    hoc_course = create(:hoc_course)
    get :congrats, params: {s: Base64.urlsafe_encode64(hoc_course.name)}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal teacher.name, body['userName']
    assert_equal false, body['under13']
    assert_equal 'teacher', body['userType']
  end

  test 'congrats grants no certificate for a PL unit without completion' do
    teacher = create(:teacher)
    sign_in teacher

    pl_course = create(:single_unit_course, participant_audience: 'teacher', instructor_audience: 'facilitator')
    pl_unit = pl_course.default_units.first
    CourseOffering.add_course_offering(pl_course)

    get :congrats, params: {s: Base64.urlsafe_encode64(pl_unit.name)}
    assert_response :success

    body = JSON.parse(response.body)
    assert_empty body['certificates']
    assert body['isPlCourse']
  end
end
