require 'test_helper'

class Api::V1::Pd::ApplicationSerializerTest < ::ActionController::TestCase
  setup do
    application_data = build :pd_teacher1920_application_hash, course: :csp
    @application = create :pd_teacher1920_application, form_data_hash: application_data
  end

  test 'Results with no school data' do
    serialized = ::Api::V1::Pd::ApplicationSerializer.new(@application, {scope: {}}).attributes
    assert_equal({}, serialized[:school_stats])
  end

  test 'Results with school data' do
    create :school_stats_by_year, school_id: @application.school_id, students_total: 100, student_am_count: 10, student_as_count: 11, student_bl_count: 12
    serialized = ::Api::V1::Pd::ApplicationSerializer.new(@application, {scope: {}}).attributes
    assert_equal(
      {
        urm_percent: '22.0%',
        american_indian_alaskan_native_percent: '10.0%',
        asian_percent: '11.0%',
        black_or_african_american_percent: '12.0%',
        hispanic_or_latino_percent: 'N/A',
        native_hawaiian_or_pacific_islander_percent: 'N/A',
        white_percent: 'N/A',
        two_or_more_races_percent: 'N/A'
      }, serialized[:school_stats].slice(
        :urm_percent,
        :american_indian_alaskan_native_percent,
        :asian_percent,
        :black_or_african_american_percent,
        :hispanic_or_latino_percent,
        :native_hawaiian_or_pacific_islander_percent,
        :white_percent,
        :two_or_more_races_percent
      )
    )
  end
end
