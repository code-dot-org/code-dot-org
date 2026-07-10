require 'test_helper'
require 'base64'

class Api::V1::CertificatesControllerTest < ActionController::TestCase
  test 'course_info for a known single-unit course' do
    unit = create(:unit, name: 'course-info-known')
    unit_group = create(:single_unit_course, :stable, unit: unit, name: 'course-info-known')
    CourseOffering.add_course_offering(unit_group)

    get :course_info, params: {locale: 'en-US', course: 'course-info-known'}
    assert_response :success
    assert_equal 'public, s-maxage=86400', response.headers['Cache-Control']
    refute_includes response.headers['Vary'].to_s, 'Cookie'
    assert_empty response.headers['Set-Cookie'].to_s
    assert_nil session[:statsig_stable_id]

    body = JSON.parse(response.body)
    assert_equal 'blank_certificate.png', body['templateFilename']
    assert_nil body['unitGroupTitle']
    refute body['prefilledTitle']
    assert_nil body['durationHours']
  end

  test 'course_info for a unit inside a unit group carries both titles' do
    unit = create(:unit, name: 'course-info-child-unit')
    unit_group = create(:single_unit_course, :stable, unit: unit, name: 'course-info-parent-group')
    CourseOffering.add_course_offering(unit_group)

    get :course_info, params: {locale: 'en-US', course: 'course-info-child-unit'}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal unit.localized_title, body['localizedTitle']
    assert_equal unit_group.localized_title, body['unitGroupTitle']
  end

  test 'course_info falls back to Hour of Code for an unrecognized course' do
    get :course_info, params: {locale: 'en-US', course: 'totally-unrecognized-course-xyz'}
    assert_response :success
    assert_equal 'public, s-maxage=300', response.headers['Cache-Control']

    body = JSON.parse(response.body)
    assert_equal I18n.t('certificates.one_hour_of_code'), body['localizedTitle']
    assert_equal 'hour_of_ai_certificate.png', body['templateFilename']
    assert_equal 'hoc', body['courseType']
    assert_nil body['durationHours']
  end

  test 'course_info reports durationHours for a self-paced PL course' do
    course_version = create(:course_version, :with_single_unit_course)
    course_version.content_root.update!(instructor_audience: 'facilitator', participant_audience: 'teacher')

    get :course_info, params: {locale: 'en-US', course: course_version.name}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal 'self_paced_pl_certificate.png', body['templateFilename']
    assert_equal 'pl', body['courseType']
    assert_equal 0.5, body['durationHours']
  end

  test 'course_info reads the locale from the path' do
    get :course_info, params: {locale: 'es-MX', course: 'totally-unrecognized-course-xyz'}
    assert_response :success
  end

  test 'course_info falls back to en-US for an unsupported locale' do
    get :course_info, params: {locale: 'not-a-real-locale', course: 'totally-unrecognized-course-xyz'}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal I18n.t('certificates.one_hour_of_code', locale: 'en-US'), body['localizedTitle']
  end

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
