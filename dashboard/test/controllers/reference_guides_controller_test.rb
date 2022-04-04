require 'test_helper'

class ReferenceGuidesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    File.stubs(:write)
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    @unit_group = create :unit_group, family_name: 'bogus-course', version_year: '2022', name: 'bogus-course-2022'
    CourseOffering.add_course_offering(@unit_group)
    @reference_guide = create :reference_guide, course_version: @unit_group.course_version

    @in_development_unit_group = create :unit_group, published_state: SharedCourseConstants::PUBLISHED_STATE.in_development,
      family_name: 'indev-course', version_year: '2022', name: 'indev-course-2022'
    CourseOffering.add_course_offering(@in_development_unit_group)

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit_group = create :unit_group, pilot_experiment: 'my-experiment', published_state: SharedCourseConstants::PUBLISHED_STATE.pilot,
    family_name: 'pilot-course', version_year: '2022', name: 'pilot-course-2022'
    CourseOffering.add_course_offering(@pilot_unit_group)
    @pilot_section = create :section, user: @pilot_teacher, unit_group: @pilot_unit_group
    @pilot_student = create(:follower, section: @pilot_section).student_user

    @reference_guide_indev = create :reference_guide, course_version: @in_development_unit_group.course_version
    @reference_guide_pilot = create :reference_guide, course_version: @pilot_unit_group.course_version
  end

  test 'data is passed to show page' do
    sign_in @levelbuilder

    get :show, params: {
      course_course_name: @reference_guide.course_offering_version,
      key: @reference_guide.key,
    }
    assert_response :ok

    show_data = css_select('script[data-referenceguide]').first.attribute('data-referenceguide').to_s

    assert_equal @reference_guide.summarize_for_show.to_json, show_data
  end

  test 'data is passed to edit_all page' do
    sign_in @levelbuilder

    get :edit_all, params: {
      course_course_name: @reference_guide.course_offering_version
    }
    assert_response :ok

    show_data = css_select('script[data-referenceguides]').first.attribute('data-referenceguides').to_s

    assert_equal [@reference_guide.summarize_for_index].to_json, show_data
  end

  test 'ref guide is updated through update route' do
    editable_reference_guide = create :reference_guide, course_version: @unit_group.course_version

    sign_in @levelbuilder

    assert_not_equal editable_reference_guide.content, 'new content'
    File.expects(:write).with {|filename, _| filename.to_s.end_with? "#{editable_reference_guide.key}.json"}.once

    post :update, params: {
      course_course_name: editable_reference_guide.course_offering_version,
      key: editable_reference_guide.key,
      content: 'new content'
    }
    assert_response :ok

    editable_reference_guide.reload
    assert_equal 'new content', editable_reference_guide.content
  end

  test 'ref guide is deleted through destroy route' do
    editable_reference_guide = create :reference_guide, course_version: @unit_group.course_version

    sign_in @levelbuilder

    post :destroy, params: {
      course_course_name: editable_reference_guide.course_offering_version,
      key: editable_reference_guide.key
    }
    assert_response :no_content

    assert_raise ActiveRecord::RecordNotFound do
      editable_reference_guide.reload
    end
  end

  test_user_gets_response_for :show, params: -> {{course_course_name: @reference_guide.course_offering_version, key: 'unknown_ref_guide'}}, user: :student, response: :not_found

  # everyone can see basic reference guides
  test_user_gets_response_for :show, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: nil, response: :success
  test_user_gets_response_for :show, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: :student, response: :success
  test_user_gets_response_for :show, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: :teacher, response: :success
  test_user_gets_response_for :show, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: :levelbuilder, response: :success

  # edit page is levelbuilder only
  test_user_gets_response_for :edit, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: nil, response: :redirect
  test_user_gets_response_for :edit, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{course_course_name: @reference_guide.course_offering_version, key: @reference_guide.key}}, user: :levelbuilder, response: :success

  # edit_all page is levelbuilder only
  test_user_gets_response_for :edit_all, params: -> {{course_course_name: @reference_guide.course_offering_version}}, user: nil, response: :redirect
  test_user_gets_response_for :edit_all, params: -> {{course_course_name: @reference_guide.course_offering_version}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit_all, params: -> {{course_course_name: @reference_guide.course_offering_version}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit_all, params: -> {{course_course_name: @reference_guide.course_offering_version}}, user: :levelbuilder, response: :success

  # pilot reference guides are restricted
  test_user_gets_response_for :show, name: 'not signed-in cannot view pilot ref guide',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version, key: @reference_guide_pilot.key}}, user: nil, response: :redirect
  test_user_gets_response_for :show, name: 'regular student cannot view pilot ref guide',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version, key: @reference_guide_pilot.key}}, user: :student, response: :forbidden
  test_user_gets_response_for :show, name: 'regular teacher cannot view pilot ref guide',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version, key: @reference_guide_pilot.key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit_all, name: 'regular teacher cannot view pilot ref guide edit_all',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :show, name: 'pilot student can view pilot ref guide',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version, key: @reference_guide_pilot.key}}, user: -> {@pilot_student}, response: :success
  test_user_gets_response_for :show, name: 'pilot teacher can view pilot ref guide',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version, key: @reference_guide_pilot.key}}, user: -> {@pilot_teacher}, response: :success
  test_user_gets_response_for :show, name: 'levelbuilder can view pilot ref guide',
    params: -> {{course_course_name: @reference_guide_pilot.course_offering_version, key: @reference_guide_pilot.key}}, user: :levelbuilder, response: :success

  # reference guides in development are restricted
  test_user_gets_response_for :show, name: 'not signed-in cannot view indev ref guide',
    params: -> {{course_course_name: @reference_guide_indev.course_offering_version, key: @reference_guide_indev.key}}, user: nil, response: :redirect
  test_user_gets_response_for :show, name: 'student cannot view indev ref guide',
    params: -> {{course_course_name: @reference_guide_indev.course_offering_version, key: @reference_guide_indev.key}}, user: :student, response: :forbidden
  test_user_gets_response_for :show, name: 'teacher cannot view indev ref guide',
    params: -> {{course_course_name: @reference_guide_indev.course_offering_version, key: @reference_guide_indev.key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :show, name: 'levelbuilder can view indev ref guide',
    params: -> {{course_course_name: @reference_guide_indev.course_offering_version, key: @reference_guide_indev.key}}, user: :levelbuilder, response: :success
end
