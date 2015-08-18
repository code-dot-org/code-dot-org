require 'test_helper'

class OpsMailerTest < ActionMailer::TestCase
  test "district_contact_added_teachers" do
    @cohorts_district = create(:cohorts_district)
    @cohort = @cohorts_district.cohort
    @district = @cohorts_district.district

    teachers = [create(:teacher)]

    mail = OpsMailer.district_contact_added_teachers(@district.contact, @cohort, teachers, [])
    assert_equal "[ops notification]   modified Test Cohort", mail.subject
    assert_equal ["ops@code.org"], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert_match "added 1 teachers", mail.body.encoded
  end

  test "workshop_in_2_weeks_reminder" do
    # Create a workshop that starts 14 days from now. Include other segments for authenticity
    @workshop_1 = create(:workshop, phase: 2, cohorts: [create(:cohort, id: 1,
      teachers: [create(:teacher, email: 'abc@code.org'), create(:teacher, email: 'xyz@code.org')])],
      facilitators: [create(:facilitator, email: 'facilitator_1@code.org')])
    @workshop_1.segments.clear
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now + 14.day, end: DateTime.now + 14.day + 60.minute)
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now + 15.day, end: DateTime.now + 15.day + 60.minute)
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now + 16.day, end: DateTime.now + 16.day + 60.minute)
    # Create a workshop that starts 13 days from now but which includes a later segment 14 days from now to verify
    # that users are not incorrectly notified.
    @workshop_2 = create(:workshop, phase: 8, cohorts: [create(:cohort, id: 2,
      teachers: [create(:teacher, email: '123@code.org'), create(:teacher, email: '987@code.org')])],
      facilitators: [create(:facilitator, email: 'facilitator_2@code.org')])
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 13.day, end: DateTime.now + 13.day + 60.minute)
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 14.day, end: DateTime.now + 14.day + 60.minute)
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 15.day, end: DateTime.now + 15.day + 60.minute)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    recipients = Set.new

    ActionMailer::Base.deliveries.each do |mail|
      recipients << mail.to[0]
    end

    assert_equal Set.new(['abc@code.org', 'xyz@code.org', 'facilitator_1@code.org']), recipients

    ['123@code.org', '987@code.org', 'facilitator_2@code.org'].each do |email|
      assert_equal false, recipients.include?(email)
    end
    assert_equal [@workshop_1], Workshop.workshops_in_2_weeks
  end

  test "workshop_in_3_days_reminder" do
    # Create a workshop that starts 3 days from now. Include other segments for authenticity
    @workshop_1 = create(:workshop, phase: 2, cohorts: [create(:cohort, id: 1,
      teachers: [create(:teacher, email: 'abc@code.org'), create(:teacher, email: 'xyz@code.org')])],
      facilitators: [create(:facilitator, email: 'facilitator_1@code.org')])
    @workshop_1.segments.clear
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now + 3.day, end: DateTime.now + 3.day + 60.minute)
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now + 4.day, end: DateTime.now + 4.day + 60.minute)
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now + 5.day, end: DateTime.now + 5.day + 60.minute)
    # Create a workshop that starts 2 days from now but which includes a later segment 3 days from now to verify
    # that users are not incorrectly notified.
    @workshop_2 = create(:workshop, phase: 8, cohorts: [create(:cohort, id: 2,
      teachers: [create(:teacher, email: '123@code.org'), create(:teacher, email: '987@code.org')])],
      facilitators: [create(:facilitator, email: 'facilitator_2@code.org')])
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 2.day, end: DateTime.now + 2.day + 60.minute)
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 3.day, end: DateTime.now + 3.day + 60.minute)
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 4.day, end: DateTime.now + 4.day + 60.minute)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    recipients = Set.new

    ActionMailer::Base.deliveries.each do |mail|
      recipients << mail.to[0]
    end

    assert_equal Set.new(['abc@code.org', 'xyz@code.org', 'facilitator_1@code.org']), recipients

    ['123@code.org', '987@code.org', 'facilitator_2@code.org'].each do |email|
      assert_equal false, recipients.include?(email)
    end
    assert_equal [@workshop_1], Workshop.workshops_in_3_days
  end

  test "exit_survey_information" do
    # Create a workshop that ends today. Include other segments for authenticity
    @workshop_1 = create(:workshop, phase: 2, cohorts: [create(:cohort, id: 1,
      teachers: [create(:teacher, email: 'abc@code.org'), create(:teacher, email: 'xyz@code.org')])],
      facilitators: [create(:facilitator, email: 'facilitator_1@code.org')])
    @workshop_1.segments.clear
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now - 2.day, end: DateTime.now - 2.day + 60.minute)
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now - 1.day, end: DateTime.now - 1.day + 60.minute)
    @workshop_1.segments << create(:segment, workshop_id: @workshop_1.id, start: DateTime.now, end: DateTime.now + 60.minute)
    # Create a workshop that ends tomorrow but which includes a segment that ends today to verify
    # that users are not incorrectly notified.
    @workshop_2 = create(:workshop, phase: 8, cohorts: [create(:cohort, id: 2,
      teachers: [create(:teacher, email: '123@code.org'), create(:teacher, email: '987@code.org')])],
      facilitators: [create(:facilitator, email: 'facilitator_2@code.org')])
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now - 1.day, end: DateTime.now - 1.day + 60.minute)
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now, end: DateTime.now + 60.minute)
    @workshop_2.segments << create(:segment, workshop_id: @workshop_2.id, start: DateTime.now + 1.day, end: DateTime.now + 1.day + 60.minute)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    recipients = Set.new

    ActionMailer::Base.deliveries.each do |mail|
      recipients << mail.to[0]
    end

    assert_equal Set.new(['abc@code.org', 'xyz@code.org', 'facilitator_1@code.org']), recipients

    ['123@code.org', '987@code.org', 'facilitator_2@code.org'].each do |email|
      assert_equal false, recipients.include?(email)
    end
    assert_equal [@workshop_1], Workshop.workshops_ending_today
  end
end
