require 'test_helper'

class WorkshopTest < ActiveSupport::TestCase
  # see also tests in OpsMailerTest

  def create_workshop(segment_starts_and_ends)
    create(:workshop).tap do |workshop|
      next if segment_starts_and_ends.blank?

      workshop.segments = []
      segment_starts_and_ends.each do |segment_start_and_end|
        workshop.segments.build(start: segment_start_and_end.first,
                                end: segment_start_and_end.last)
      end
      workshop.save!
    end
  end

  setup do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0)

    @old_workshop = create_workshop [[Time.now.utc - 10.days, Time.now.utc - 9.days]]
    @tomorrow_workshop = create_workshop [[Time.now.utc + 1.days, Time.now.utc + 1.days + 1.hour]]

    now = Time.zone.today
    today_start = Time.new(now.year, now.month, now.mday, 9, 0, 0, 0)
    today_end = Time.new(now.year, now.month, now.mday, 17, 0, 0, 0)

    @today_workshop = create_workshop [[today_start, today_end]]
    # give this one a phase
    @today_workshop.phase = 1
    @today_workshop.save!

    @today_ending_workshop = create_workshop [[today_start - 5.days, today_end - 5.days], [today_start + 5.minutes, today_end + 5.minutes]]
    @today_starting_workshop = create_workshop [[today_start + 5.days, today_end + 5.days], [today_start + 5.minutes, today_end + 5.minutes]]

    @workshop_in_2_weeks = create_workshop [[today_start + 2.weeks, today_end + 2.weeks]]

    @workshop_in_3_days = create_workshop [[today_start + 3.days, today_end + 3.days]]
  end

  teardown do
    Timecop.return
  end

  test "workshops ending today" do
    assert_equal [@today_workshop, @today_ending_workshop], Workshop.ending_today
  end

  test "workshops in 2 weeks" do
    assert_equal [@workshop_in_2_weeks], Workshop.in_2_weeks
  end

  test "workshops in 3 days" do
    assert_equal [@workshop_in_3_days], Workshop.in_3_days
  end

  test "automated_email_recipients" do
    expected_recipients = Set.new

    # just a workshop with a facilitator
    workshop = create :workshop
    expected_recipients << workshop.facilitators.first

    assert_equal expected_recipients, Set.new(workshop.automated_email_recipients)

    # add a district contact
    create :district_contact # not this one
    dc = create :district_contact
    district = create :district, contact: dc
    cohort = workshop.cohorts.first
    cohort.districts << district
    cohort.save!
    expected_recipients << dc

    workshop = workshop.reload
    assert_equal expected_recipients, Set.new(workshop.automated_email_recipients)

    # add some teachers
    create :teacher
    create :teacher
    t1 = create :teacher
    t2 = create :teacher

    cohort = workshop.cohorts.first
    cohort.teachers << t1
    cohort.teachers << t2
    cohort.save!

    expected_recipients << t1
    expected_recipients << t2

    workshop = workshop.reload
    assert_equal expected_recipients, Set.new(workshop.automated_email_recipients)

    # add another cohort
    cohort = create :cohort
    cohort.teachers << create(:teacher)
    expected_recipients << cohort.teachers.first
    cohort.save!
    workshop.cohorts << cohort
    workshop.save!

    workshop = workshop.reload
    assert_equal expected_recipients, Set.new(workshop.automated_email_recipients)

    # add an unexpected teacher
    t = create :teacher
    workshop.unexpected_teachers << t
    expected_recipients << t
    workshop.save!

    workshop = workshop.reload
    assert_equal expected_recipients, Set.new(workshop.automated_email_recipients)
  end

  test "send automated emails" do
    Workshop.send_automated_emails

    assert_equal 4, ActionMailer::Base.deliveries.count

    subjects = ActionMailer::Base.deliveries.map(&:subject)

    assert_equal 1, subjects.grep(/Important: Your workshop is coming up in 14 days/).count
    assert_equal 1, subjects.grep(/Important: Your workshop is coming up in 3 days/).count
    assert_equal 2, subjects.grep(/Feedback requested for your Code.org PD workshop/).count
  end

  test "phase long name" do
    # from WorkshopConstants
    #  PHASES = {
    #   1 => {id: 1, short_name: PHASE_1, long_name: 'Phase 1: Online Introduction'},
    #   2 => {id: 2, short_name: PHASE_2, long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},

    assert_equal 'Phase 1: Online Introduction', create(:workshop, phase: 1).phase_long_name
    assert_equal 'Phase 2: Blended Summer Study', create(:workshop, phase: 2).phase_long_name

    assert_equal nil, create(:workshop, phase: "????").phase_long_name
    assert_equal nil, create(:workshop, phase: nil).phase_long_name
  end

  test "prerequisite phase" do
    # from WorkshopConstants
    #  PHASES = {
    #   1 => {id: 1, short_name: PHASE_1, long_name: 'Phase 1: Online Introduction'},
    #   2 => {id: 2, short_name: PHASE_2, long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},

    assert_equal nil, create(:workshop, phase: 1).prerequisite_phase
    phase1 = {id: 1, short_name: 'Phase 1', long_name: 'Phase 1: Online Introduction'}
    assert_equal phase1, create(:workshop, phase: 2).prerequisite_phase
    assert_equal nil, create(:workshop, phase: 3).prerequisite_phase

    assert_equal nil, create(:workshop, phase: "????").prerequisite_phase
    assert_equal nil, create(:workshop, phase: nil).prerequisite_phase
  end

  test "program_type_short_name" do
    # from WorkshopConstants
    #  CS_IN_S = 'CS in Science'
    #  CS_IN_A = 'CS in Algebra'
    #  ...
    #  PROGRAM_TYPES = {
    #    1 => {id: 1, short_name: CS_IN_S, long_name: 'Computer Science in Science'},
    #    2 => {id: 2, short_name: CS_IN_A, long_name: 'Computer Science in Algebra'},

    assert_equal 'CS in Science', create(:workshop, program_type: '1').program_type_short_name
    assert_equal 'CS in Algebra', create(:workshop, program_type: '2').program_type_short_name
  end

  test "phase_short_name" do
    # from WorkshopConstants
    #  PHASE_1 = 'Phase 1'
    #  PHASE_2 = 'Phase 2'
    #  ...
    #  PHASES = {
    #    1 => {id: 1, short_name: PHASE_1, long_name: 'Phase 1: Online Introduction'},
    #    2 => {id: 2, short_name: PHASE_2, long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},

    assert_equal 'Phase 1', create(:workshop, phase: 1).phase_short_name
    assert_equal 'Phase 2', create(:workshop, phase: 2).phase_short_name

    assert_equal nil, create(:workshop, phase: "????").phase_long_name
    assert_equal nil, create(:workshop, phase: nil).phase_short_name
  end

  test "exit_survey_url" do
    # from WorkshopConstants
    #  PROGRAM_TYPES = {
    #    1 => {id: 1, short_name: CS_IN_S, long_name: 'Computer Science in Science'},
    #    2 => {id: 2, short_name: CS_IN_A, long_name: 'Computer Science in Algebra'},
    #  ...
    #  PHASES = {
    #    ...
    #    2 => {id: 2, short_name: PHASE_2, long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},
    #    4 => {id: 4, short_name: PHASE_3A, long_name: 'Phase 3: Part A'},
    #  ...
    #  EXIT_SURVEY_IDS = {
    #    CS_IN_S => {
    #      PHASE_2 => '1QG9eCbKJD26UNvTC0C9ZZyrp63WjzQSK5gQPP4lsZ2c',
    #  ...
    #    },
    #    CS_IN_A => {
    #      ...
    #      PHASE_3A => '1oBYFuv1xlInKD7asJ7gR4GA1xbsdKDjG1PI4tvgdwWc',

    expected_url1 = 'https://docs.google.com/a/code.org/forms/d/1QG9eCbKJD26UNvTC0C9ZZyrp63WjzQSK5gQPP4lsZ2c/viewform'
    assert_equal expected_url1, create(:workshop, program_type: '1', phase: 2).exit_survey_url

    expected_url2 = 'https://docs.google.com/a/code.org/forms/d/1oBYFuv1xlInKD7asJ7gR4GA1xbsdKDjG1PI4tvgdwWc/viewform'
    assert_equal expected_url2, create(:workshop, program_type: '2', phase: 4).exit_survey_url

    assert_nil create(:workshop, program_type: '1', phase: 1).exit_survey_url
    assert_nil create(:workshop, program_type: '1', phase: 999).exit_survey_url
  end

  test "location and instructions can be 500 chars" do
    string_500 = "a" * 500

    workshop = Workshop.create!(name: 'name', location: string_500, instructions: string_500, program_type: '1')

    assert_equal string_500, workshop.location
    assert_equal string_500, workshop.instructions
  end

end
