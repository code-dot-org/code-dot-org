require 'test_helper'

class ReferenceGuidesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    File.stubs(:write)
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    unit_group = create :unit_group, family_name: 'bogus-course', version_year: '2022', name: 'bogus-course-2022'
    CourseOffering.add_course_offering(unit_group)
    @reference_guide = create :reference_guide, course_version: unit_group.course_version
  end

  test 'data is passed to show page' do
    sign_in @levelbuilder

    get :show, params: {
      course_course_name: @reference_guide.course_offering_version,
      key: @reference_guide.key,
    }
    assert_response :ok

    show_data = css_select('script[data-referenceguide]').first.attribute('data-referenceguide').to_s

    reference_guide = create :reference_guide

    assert_equal reference_guide.summarize_for_show.to_json, show_data
  end
end
