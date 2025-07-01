require 'test_helper'

class Api::V1::Pd::TeacherAttendanceReportControllerTest < ActionController::TestCase
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
    organizer_name
    organizer_email
    year
    hours
    days
  ).freeze

  self.use_transactional_test_case = true

  setup_all do
    travel_to Time.zone.parse('2025-01-15 12:00:00')
  end

  setup do
    @workshop_admin = create :workshop_admin
    @organizer = create :workshop_organizer
    @program_manager = create :program_manager

    # CSF workshop for this program manager with 10 teachers
    @pm_workshop = build :workshop, :ended, organizer: @program_manager, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 3
    @pm_workshop.save(validate: false)

    # CSF workshop for this organizer with 2 teachers
    @workshop = build :workshop, :ended, organizer: @organizer, course: Pd::Workshop::COURSE_CSF, enrolled_and_attending_users: 2
    @workshop.save(validate: false)

    # Non-CSF workshop from a different organizer, with 1 teacher
    @other_workshop = create :byo_workshop, :ended, enrolled_and_attending_users: 1
  end

  [:admin, :workshop_organizer, :program_manager].each do |user_type|
    test_user_gets_response_for :index, user: user_type
  end

  test_user_gets_response_for :index, response: :forbidden, user: :teacher

  test 'workshop admins get teacher attendance info' do
    sign_in @workshop_admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert response.first
    assert_common_fields response.first
  end

  test 'organizers get teacher attendance info' do
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert response.first
    assert_common_fields response.first
  end

  test 'program managers get teacher attendance info' do
    sign_in @program_manager

    get :index
    assert_response :success
    response = JSON.parse(@response.body)

    assert response.first
    assert_common_fields response.first
  end

  test 'workshop admins see all teacher attendance info' do
    sign_in @workshop_admin

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    # 3 + 2 + 1 teachers
    assert_equal 6, response.count
    assert_equal [@pm_workshop.id, @workshop.id, @other_workshop.id].sort, response.map {|r| r['workshop_id']}.uniq.sort
  end

  test 'organizers only see their own teachers attendance info' do
    sign_in @organizer

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 2, response.count
    assert_equal [@workshop.id], response.map {|r| r['workshop_id']}.uniq
  end

  test 'program managers only see their own teachers attendance info' do
    sign_in @program_manager

    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 3, response.count
    assert_equal [@pm_workshop.id], response.map {|r| r['workshop_id']}.uniq
  end

  test 'returns only workshops that have ended and have teachers' do
    # Workshop, not ended, with teachers (should not be returned)
    workshop_in_progress = create :workshop, enrolled_and_attending_users: 2
    workshop_in_progress.start!

    # Workshop, ended, with no teachers (should not be returned)
    teacherless_workshop = create :workshop, :ended

    sign_in @workshop_admin
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    workshops_returned = response.map {|r| r['workshop_id']}.uniq

    assert_includes workshops_returned, @pm_workshop.id
    assert_includes workshops_returned, @workshop.id
    assert_includes workshops_returned, @other_workshop.id
    refute_includes workshops_returned, workshop_in_progress.id
    refute_includes workshops_returned, teacherless_workshop.id
  end

  test 'filter by schedule' do
    start_date = Time.zone.today - 6.months
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
    start_date = Time.zone.today - 6.months
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
    sign_in @workshop_admin

    # @pm_workshop and @workshop are CSF; @other_workshop is not
    {
      'csf' => [@pm_workshop.id, @workshop.id],
      '-csf' => [@other_workshop.id]
    }.each do |course_param, expected|
      get :index, params: {course: course_param}
      assert_response :success
      response = JSON.parse(@response.body)
      assert_equal expected, response.map {|r| r['workshop_id']}.uniq.sort
    end
  end

  test 'csv' do
    sign_in @workshop_admin
    get :index, format: :csv
    assert_response :success
    response = CSV.parse(@response.body)

    # 6 teacher attendances + 1 header row
    assert_equal 7, response.count
    assert_equal EXPECTED_COMMON_FIELDS.count, response.first.count

    # Check that column 11 in the header row is workshop id
    assert_equal 'Workshop Id', response.first[11]

    # Check expected row counts for our test workshops
    assert_equal(3, response.count {|row| row[11] == @pm_workshop.id.to_s})
    assert_equal(2, response.count {|row| row[11] == @workshop.id.to_s})
    assert_equal(1, response.count {|row| row[11] == @other_workshop.id.to_s})
  end

  private def assert_common_fields(line)
    EXPECTED_COMMON_FIELDS.each do |field_name|
      assert line.key?(field_name), "Expected common field #{field_name} not found in report line: #{line}"
    end
  end
end
