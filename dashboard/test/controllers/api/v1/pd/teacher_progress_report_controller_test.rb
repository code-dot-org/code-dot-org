require 'test_helper'

class Api::V1::Pd::TeacherProgressReportControllerTest < ::ActionController::TestCase
  freeze_time

  EXPECTED_COMMON_FIELDS = %w(
    teacher_name
    teacher_id
    teacher_email
    plp_name
    state
    district_name
    district_id
    school
    course
    subject
    workshop_id
    workshop_dates
    workshop_name
    workshop_type
    organizer_name
    organizer_email
    year
    hours
    days
  ).freeze

  EXPECTED_PAYMENT_FIELDS = %w(
    payment_type
    payment_rate
    qualified
    payment_amount
  ).freeze

  setup do
    @admin = create :admin
    @organizer = create :workshop_organizer

    # Workshop with 10 teachers.
    @workshop = create :pd_ended_workshop, organizer: @organizer
    10.times do
      create :pd_workshop_participant, workshop: @workshop, enrolled: true, in_section: true, attended: true
    end

    # Extra workshop from a different organizer, with 1 teacher.
    @other_workshop = create :pd_ended_workshop
    create :pd_workshop_participant, workshop: @other_workshop, enrolled: true, in_section: true, attended: true
  end

  test 'admins can view the report' do
    sign_in @admin
    get :index
    assert_response :success
  end

  test 'workshop organizers can view the report' do
    sign_in @organizer
    get :index
    assert_response :success
  end

  test 'other users cannot view report' do
    sign_in create(:teacher)
    get :index
    assert_response :forbidden
  end

  test 'admins get payment info' do
    sign_in @admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_common_fields response.first
    assert_payment_fields response.first
  end

  test 'organizers do not get payment info' do
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_common_fields response.first
    refute_payment_fields response.first
  end

  test 'admins see all workshops' do
    sign_in @admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_equal 11, response.count
    assert_equal [@workshop.id, @other_workshop.id].sort, response.map{|r| r['workshop_id']}.uniq.sort
  end

  test 'organizers only see their own workshops' do
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 10, response.count
    assert_equal [@workshop.id], response.map{|r| r['workshop_id']}.uniq
  end

  test 'Returns only workshops that have ended and have teachers' do
    # New workshop, not ended, with teachers that should not be returned.
    workshop_in_progress = create :pd_workshop, num_sessions: 1
    workshop_in_progress.start!
    5.times do
      create :pd_workshop_participant, workshop: workshop_in_progress, enrolled: true, in_section: true, attended: true
    end

    # Workshop, ended, with no teachers.
    create :pd_ended_workshop

    sign_in @admin
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 11, response.count
    assert_equal [@workshop.id, @other_workshop.id].sort, response.map{|r| r['workshop_id']}.uniq.sort
  end

  test 'filter by schedule' do
    start_date = Date.today - 6.months
    end_date = start_date + 1.month

    workshop_in_range = create :pd_ended_workshop, sessions_from: start_date + 2.weeks
    teacher_in_range = create :pd_workshop_participant, workshop: workshop_in_range, enrolled: true, in_section: true, attended: true

    # Noise
    workshop_before = create :pd_ended_workshop, sessions_from: start_date - 1.day
    create :pd_workshop_participant, workshop: workshop_before, enrolled: true, in_section: true, attended: true

    workshop_after = create :pd_ended_workshop, sessions_from: end_date + 1.day
    create :pd_workshop_participant, workshop: workshop_after, enrolled: true, in_section: true, attended: true

    sign_in @admin
    get :index, params: {start: start_date, end: end_date, query_by: 'schedule'}

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal teacher_in_range.id, response.first['teacher_id']
    assert_equal workshop_in_range.id, response.first['workshop_id']
  end

  test 'filter by end date' do
    start_date = Date.today - 6.months
    end_date = start_date + 1.month

    workshop_in_range = create :pd_ended_workshop, ended_at: start_date + 2.weeks
    teacher_in_range = create :pd_workshop_participant, workshop: workshop_in_range, enrolled: true, in_section: true, attended: true

    # Noise
    workshop_before = create :pd_ended_workshop, ended_at: start_date - 1.day
    create :pd_workshop_participant, workshop: workshop_before, enrolled: true, in_section: true, attended: true

    workshop_after = create :pd_ended_workshop, ended_at: end_date + 1.day
    create :pd_workshop_participant, workshop: workshop_after, enrolled: true, in_section: true, attended: true

    sign_in @admin
    get :index, params: {start: start_date, end: end_date, query_by: 'end'}

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal teacher_in_range.id, response.first['teacher_id']
    assert_equal workshop_in_range.id, response.first['workshop_id']
  end

  test 'csv' do
    sign_in @admin
    get :index, format: :csv
    assert_response :success
    response = CSV.parse(@response.body)

    # 12 rows (header + 11 teacher rows)
    assert_equal 12, response.count
    assert_equal EXPECTED_COMMON_FIELDS.count + EXPECTED_PAYMENT_FIELDS.count, response.first.count
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
