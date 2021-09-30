require 'test_helper'

class Api::V1::Pd::ApplicationSerializerTest < ::ActionController::TestCase
  setup do
    application_data = build :pd_teacher_application_hash, course: :csp
    @application = create :pd_teacher_application, form_data_hash: application_data
  end

  test 'Invalid application data does not break serializer result' do
    # Application data could have more than 1 invalid fields
    app_data = build :pd_teacher_application_hash, course: :csp, school: 'invalid code'
    app = create :pd_teacher_application, form_data_hash: app_data

    serialized_app = Api::V1::Pd::ApplicationSerializer.new(app, {scope: {}}).attributes
    assert serialized_app.present?
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

  test 'Results with status change log' do
    program_manager = create :program_manager
    @application.update(
      status_log: [{
        status: 'unreviewed',
        at: Time.parse('2019-09-01 12:00 -07:00')
      }, {
        status: 'pending',
        at: Time.parse('2019-10-01 9:00 -07:00')
      }, {
        status: 'accepted_no_cost_registration',
        at: Time.parse('2019-11-06 15:00 -08:00')
      }],
      status_timestamp_change_log: [{
        title: 'accepted_no_cost_registration_email',
        time: Time.parse('2019-11-06 15:01 -08:00'),
      }, {
        title: 'pending',
        time: Time.parse('2019-10-01 09:00 -07:00'),
        changing_user_id: program_manager.id,
        changing_user_name: program_manager.name
      }, {
        title: 'accepted_no_cost_registration',
        time: Time.parse('2019-11-06 15:00 -08:00'),
        changing_user_id: program_manager.id,
        changing_user_name: program_manager.name
      }].to_json
    )

    serialized = ::Api::V1::Pd::ApplicationSerializer.new(@application, {scope: {}}).attributes
    assert_equal(
      [{
        title: 'Accepted No Cost Registration Email',
        time: '2019-11-06 15:01 PST'
      }, {
        title: 'Accepted No Cost Registration',
        time: '2019-11-06 15:00 PST',
        changing_user: program_manager.name,
      }, {
        title: 'Pending',
        time: '2019-10-01 09:00 PDT',
        changing_user: program_manager.name,
      }, {
        title: 'Unreviewed',
        time: '2019-09-01 12:00 PDT'
      }], serialized[:status_change_log]
    )
  end
end
