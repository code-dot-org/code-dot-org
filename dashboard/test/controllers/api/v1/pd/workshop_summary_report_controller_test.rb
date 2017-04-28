require 'test_helper'

class Api::V1::Pd::WorkshopSummaryReportControllerTest < ::ActionController::TestCase
  freeze_time

  EXPECTED_COMMON_FIELDS = %w(
    organizer_name
    organizer_id
    organizer_email
    workshop_dates
    workshop_type
    section_url
    facilitators
    num_facilitators
    workshop_id
    workshop_name
    course
    subject
    num_registered
    num_qualified_teachers
    days
  ).tap do |fields|
    (1..Pd::Payment::WorkshopSummary::REPORT_FACILITATOR_DETAILS_COUNT).each do |n|
      fields << "facilitator_name_#{n}"
      fields << "facilitator_email_#{n}"
    end
    (1..Pd::Payment::WorkshopSummary::REPORT_ATTENDANCE_DAY_COUNT).each do |n|
      fields << "attendance_day_#{n}"
    end
  end.freeze

  EXPECTED_PAYMENT_FIELDS = %w(
    pay_period
    payment_type
    qualified
    teacher_attendance_days
    food_payment
    facilitator_payment
    staffer_payment
    venue_payment
    payment_total
  ).freeze

  self.use_transactional_test_case = true
  setup_all do
    @admin = create :admin
    @organizer = create :workshop_organizer

    # CSF workshop for this organizer.
    @workshop = create :pd_ended_workshop, organizer: @organizer, course: Pd::Workshop::COURSE_CSF
    create :pd_workshop_participant, workshop: @workshop, enrolled: true, in_section: true, attended: true

    # Non-CSF workshop from a different organizer
    @other_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_ECS,
      subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
  end

  [:admin, :workshop_organizer].each do |user_type|
    test_user_gets_response_for :index, user: user_type
  end

  test_user_gets_response_for :index, response: :forbidden, user: :teacher

  test 'admins get payment info' do
    sign_in @admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert response.first
    assert_common_fields response.first
    assert_payment_fields response.first
  end

  test 'organizers do not get payment info' do
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert response.first
    assert_common_fields response.first
    refute_payment_fields response.first
  end

  test 'admins see all workshops' do
    sign_in @admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 2, response.count
  end

  test 'organizers only see their own workshops' do
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal @workshop.id, response.first['workshop_id']
  end

  test 'Returns only workshops that have ended' do
    # New workshop, not ended, should not be returned.
    create :pd_workshop

    sign_in @admin
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 2, response.count
    assert_equal [@workshop.id, @other_workshop.id].sort, response.map {|line| line['workshop_id']}.sort
  end

  test 'filter by schedule' do
    start_date = Date.today - 6.months
    end_date = start_date + 1.month

    workshop_in_range = create :pd_ended_workshop, sessions_from: start_date + 2.weeks

    # Noise
    create :pd_ended_workshop, sessions_from: start_date - 1.day
    create :pd_ended_workshop, sessions_from: end_date + 1.day

    sign_in @admin
    get :index, params: {start: start_date, end: end_date, query_by: 'schedule'}

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal workshop_in_range.id, response.first['workshop_id']
  end

  test 'filter by end date' do
    start_date = Date.today - 6.months
    end_date = start_date + 1.month

    workshop_in_range = create :pd_ended_workshop, ended_at: start_date + 2.weeks

    # Noise
    create :pd_ended_workshop, ended_at: start_date - 1.day
    create :pd_ended_workshop, ended_at: end_date + 1.day

    sign_in @admin
    get :index, params: {start: start_date, end: end_date, query_by: 'end'}

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal workshop_in_range.id, response.first['workshop_id']
  end

  test 'filter by course' do
    sign_in @admin

    # @workshop is CSF; @other_workshop is not
    {
      'csf' => @workshop,
      '-csf' => @other_workshop
    }.each do |course_param, workshop|
      get :index, params: {course: course_param}
      assert_response :success
      response = JSON.parse(@response.body)
      assert_equal 1, response.count
      assert_equal workshop.id, response.first['workshop_id']
    end
  end

  test 'csv' do
    sign_in @admin
    get :index, format: :csv
    assert_response :success
    response = CSV.parse(@response.body)

    # 3 rows (header + workshop rows)
    assert_equal 3, response.count
    assert_equal EXPECTED_COMMON_FIELDS.count + EXPECTED_PAYMENT_FIELDS.count, response.first.count
  end

  test 'includes unpaid workshops' do
    unpaid_workshop = create :pd_ended_workshop, organizer: @organizer, course: Pd::Workshop::COURSE_CSD
    create :pd_workshop_participant, workshop: @workshop, enrolled: true, in_section: true, attended: true

    sign_in @admin
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 3, response.count
    unpaid_report = response.find {|row| row['workshop_id'] == unpaid_workshop.id}
    assert_not_nil unpaid_report
    refute unpaid_report['qualified']
    assert_nil unpaid_report['payment_total']
  end

  private

  def assert_common_fields(line)
    EXPECTED_COMMON_FIELDS.each do |field_name|
      assert line.key?(field_name), "Expected common field #{field_name} not found in report line: #{line}"
    end
  end

  def assert_payment_fields(line)
    EXPECTED_PAYMENT_FIELDS.each do |field_name|
      assert line.key?(field_name), "Expected payment field #{field_name} not found in report line: #{line}"
    end
  end

  def refute_payment_fields(line)
    EXPECTED_PAYMENT_FIELDS.each do |field_name|
      refute line.key?(field_name), "Unexpected payment field #{field_name} found in report line: #{line}"
    end
  end
end
