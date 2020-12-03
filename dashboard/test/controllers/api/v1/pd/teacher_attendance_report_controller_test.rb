require 'test_helper'

class Api::V1::Pd::TeacherAttendanceReportControllerTest < ::ActionController::TestCase
  freeze_time

  EXPECTED_COMMON_FIELDS = %w(
    teacher_first_name
    teacher_last_name
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
    on_map
    funded
    organizer_name
    organizer_email
    year
    hours
    days
  ).freeze

  EXPECTED_PAYMENT_FIELDS = %w(
    pay_period
    payment_type
    payment_rate
    qualified
    payment_amount
  ).freeze

  self.use_transactional_test_case = true
  setup_all do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    @workshop_admin = create :workshop_admin
    @organizer = create :workshop_organizer
    @program_manager = create :program_manager

    # CSF workshop from this program manager with 10 teachers.
    @pm_workshop = create :workshop, :ended,
      organizer: @program_manager,
      course: Pd::Workshop::COURSE_CSF,
      started_at: 1.day.ago,
      ended_at: 1.day.ago,
      sessions_from: 1.day.ago
    10.times do
      create :pd_workshop_participant, workshop: @pm_workshop, enrolled: true, attended: true
    end

    # CSF workshop from this organizer with 10 teachers.
    @workshop = create :workshop, :ended,
      organizer: @organizer,
      course: Pd::Workshop::COURSE_CSF,
      started_at: 1.day.ago,
      ended_at: 1.day.ago,
      sessions_from: 1.day.ago
    10.times do
      create :pd_workshop_participant, workshop: @workshop, enrolled: true, attended: true
    end

    # Non-CSF workshop from a different organizer, with 1 teacher.
    @other_workshop = create :workshop, :ended,
      course: Pd::Workshop::COURSE_ECS,
      subject: Pd::Workshop::SUBJECT_ECS_PHASE_2,
      started_at: 1.day.ago,
      ended_at: 1.day.ago,
      sessions_from: 1.day.ago
    create :pd_workshop_participant, workshop: @other_workshop, enrolled: true, attended: true
  end

  # -- SKIP -- Setup method fails 6 hours per day due to time zone differences
  # test_user_gets_response_for :index, user: :workshop_admin
  # test_user_gets_response_for :index, user: :workshop_organizer
  # test_user_gets_response_for :index, user: :program_manager
  # test_user_gets_response_for :index, response: :forbidden, user: :teacher

  test 'workshop admins get payment info' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @workshop_admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_common_fields response.first
    assert_payment_fields response.first
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'organizers do not get payment info' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_common_fields response.first
    refute_payment_fields response.first
  end

  test 'program managers do not get payment info' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @program_manager

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_common_fields response.first
    refute_payment_fields response.first
  end

  test 'workshop admins see all workshops' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @workshop_admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert_equal 21, response.count
    assert_equal [@pm_workshop.id, @workshop.id, @other_workshop.id].sort, response.map {|r| r['workshop_id']}.uniq.sort
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'organizers only see their own workshops' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 10, response.count
    assert_equal [@workshop.id], response.map {|r| r['workshop_id']}.uniq
  end

  test 'program managers only see their own workshops' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @program_manager

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 10, response.count
    assert_equal [@pm_workshop.id], response.map {|r| r['workshop_id']}.uniq
  end

  test 'Returns only workshops that have ended and have teachers' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    # Workshop, not ended, with teachers
    # This workshop should not be returned
    workshop_in_progress = create :workshop
    workshop_in_progress.start!
    5.times do
      create :pd_workshop_participant, workshop: workshop_in_progress, enrolled: true, attended: true
    end

    # Workshop, ended, with no teachers
    # This workshop should not be returned
    teacherless_workshop = create :workshop, :ended

    sign_in @workshop_admin
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    workshops_returned = response.map {|r| r['workshop_id']}.uniq

    # Ensure we see responses for the eligible workshops (see setup_all)
    assert_includes workshops_returned, @pm_workshop.id
    assert_includes workshops_returned, @workshop.id
    assert_includes workshops_returned, @other_workshop.id

    # Ensure we do not see responses for the ineligible workshops
    refute_includes workshops_returned, workshop_in_progress.id
    refute_includes workshops_returned, teacherless_workshop.id
  end

  test 'filter by schedule' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    start_date = Date.today - 6.months
    end_date = start_date + 1.month

    workshop_in_range = create :workshop, :ended, sessions_from: start_date + 2.weeks
    teacher_in_range = create :pd_workshop_participant, workshop: workshop_in_range, enrolled: true, attended: true

    # Noise
    workshop_before = create :workshop, :ended, sessions_from: start_date - 1.day
    create :pd_workshop_participant, workshop: workshop_before, enrolled: true, attended: true

    workshop_after = create :workshop, :ended, sessions_from: end_date + 1.day
    create :pd_workshop_participant, workshop: workshop_after, enrolled: true, attended: true

    sign_in @workshop_admin
    get :index, params: {start: start_date, end: end_date, query_by: 'schedule'}

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal teacher_in_range.id, response.first['teacher_id']
    assert_equal workshop_in_range.id, response.first['workshop_id']
  end

  test 'filter by end date' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    start_date = Date.today - 6.months
    end_date = start_date + 1.month

    workshop_in_range = create :workshop, :ended, ended_at: start_date + 2.weeks
    teacher_in_range = create :pd_workshop_participant, workshop: workshop_in_range, enrolled: true, attended: true

    # Noise
    workshop_before = create :workshop, :ended, ended_at: start_date - 1.day
    create :pd_workshop_participant, workshop: workshop_before, enrolled: true, attended: true

    workshop_after = create :workshop, :ended, ended_at: end_date + 1.day
    create :pd_workshop_participant, workshop: workshop_after, enrolled: true, attended: true

    sign_in @workshop_admin
    get :index, params: {start: start_date, end: end_date, query_by: 'end'}

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.count
    assert_equal teacher_in_range.id, response.first['teacher_id']
    assert_equal workshop_in_range.id, response.first['workshop_id']
  end

  test 'filter by course' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @workshop_admin

    # @pm_workshop and @workshop are CSF; @other_workshop is not
    {
      'csf' => {workshop_id: [@pm_workshop.id, @workshop.id], teacher_count: 20},
      '-csf' => {workshop_id: [@other_workshop.id], teacher_count: 1}
    }.each do |course_param, expected|
      get :index, params: {course: course_param}
      assert_response :success
      response = JSON.parse(@response.body)
      assert_equal expected[:teacher_count], response.count
      assert_equal expected[:workshop_id], response.map {|r| r['workshop_id']}.uniq.sort
    end
  end

  test 'csv' do
    skip 'test is flaky for 6 hours per day due to time zone differences'
    sign_in @workshop_admin
    get :index, format: :csv
    assert_response :success
    response = CSV.parse(@response.body)

    # Check that we have the expected number of columns in the header row
    assert_equal EXPECTED_COMMON_FIELDS.count + EXPECTED_PAYMENT_FIELDS.count, response.first.count

    # Check that column 11 in the header row is workshop id
    assert_equal 'Workshop Id', response.first[11]

    # Check expected row counts for our test workshops
    # (We don't count all rows to insulate this test against existing state)
    assert_equal 10, response.select {|row| row[11] == @pm_workshop.id.to_s}.count
    assert_equal 10, response.select {|row| row[11] == @workshop.id.to_s}.count
    assert_equal 1, response.select {|row| row[11] == @other_workshop.id.to_s}.count
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
