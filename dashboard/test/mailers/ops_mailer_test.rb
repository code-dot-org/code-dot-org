require 'test_helper'

class OpsMailerTest < ActionMailer::TestCase
  test "district_contact_added_teachers" do
    @cohorts_district = create(:cohorts_district)
    @cohort = @cohorts_district.cohort
    @district = @cohorts_district.district

    teachers = [create(:teacher)]

    mail = OpsMailer.district_contact_added_teachers(@district.contact, @cohort, teachers, [])
    assert_equal "[ops notification] #{@district.contact.ops_first_name} #{@district.contact.ops_last_name} modified Test Cohort", mail.subject
    assert_equal ["ops@code.org"], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert_match "added 1 teachers", mail.body.encoded
  end

  test "workshop_in_2_weeks_reminder" do
    # Create a workshop that starts 14 days from now. Include other segments for authenticity
    @workshop_1 = create_workshop(['abc@code.org', 'xyz@code.org'], 'facilitator_1@code.org', Date.today + 14.day)

    # Create a workshop that starts 13 days from now but which includes a later segment 14 days from now to verify
    # that users are not incorrectly notified.
    @workshop_2 = create_workshop(['123@code.org', '987@code.org'], 'facilitator_2@code.org', Date.today + 13.day)

    # Create a workshop that starts entirely after 14 days from now to verify that users are not incorrectly notified.
    @workshop_3 = create_workshop(['xxx@code.org', 'yyy@code.org'], 'facilitator_3@code.org', Date.today + 30.day)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    correct_recipients = Set.new
    incorrect_recipients = Set.new(%w{
      123@code.org 987@code.org facilitator_2@code.org xxx@code.org yyy@code.org facilitator_3@code.org
    })

    ActionMailer::Base.deliveries.each do |mail|
      correct_recipients << mail.to[0]
    end

    assert_equal Set.new(%w{abc@code.org xyz@code.org facilitator_1@code.org}), correct_recipients

    incorrect_recipients.each do |email|
      assert_equal false, correct_recipients.include?(email)
    end
    assert_equal [@workshop_1], Workshop.workshops_in_2_weeks
  end

  test "workshop_in_3_days_reminder" do
    # Create a workshop that starts 3 days from now. Include other segments for authenticity
    @workshop_1 = create_workshop(['abc@code.org', 'xyz@code.org'], 'facilitator_1@code.org', Date.today + 3.day)

    # Create a workshop that starts 2 days from now but which includes a later segment 3 days from now to verify
    # that users are not incorrectly notified.
    @workshop_2 = create_workshop(['123@code.org', '987@code.org'], 'facilitator_2@code.org', Date.today + 2.day)

    # Create a workshop that ends completely before 3 days from now to verify that users are not incorrectly notified.
    @workshop_3 = create_workshop(['xxx@code.org', 'yyy@code.org'], 'facilitator_3@code.org', Date.today - 30.day)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    correct_recipients = Set.new
    incorrect_recipients = Set.new(%w{
      123@code.org 987@code.org facilitator_2@code.org xxx@code.org yyy@code.org facilitator_3@code.org
    })

    ActionMailer::Base.deliveries.each do |mail|
      correct_recipients << mail.to[0]
    end

    assert_equal Set.new(%w{abc@code.org xyz@code.org facilitator_1@code.org}), correct_recipients

    incorrect_recipients.each do |email|
      assert_equal false, correct_recipients.include?(email)
    end
    assert_equal [@workshop_1], Workshop.workshops_in_3_days
  end

  test "exit_survey_information" do
    # Create a workshop that ends today. Include other segments for authenticity
    @workshop_1 = create_workshop(['abc@code.org', 'xyz@code.org'], 'facilitator_1@code.org', Date.today - 2.day)

    # Create a workshop that ends tomorrow but which includes a segment today to verify that users are not incorrectly notified.
    @workshop_2 = create_workshop(['123@code.org', '987@code.org'], 'facilitator_2@code.org', Date.today - 1.day)

    # Create a workshop that starts well after today to verify that users are not incorrectly notified.
    @workshop_3 = create_workshop(['xxx@code.org', 'yyy@code.org'], 'facilitator_3@code.org', Date.today + 30.day)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    correct_recipients = Set.new
    incorrect_recipients = Set.new(%w{
      123@code.org 987@code.org facilitator_2@code.org xxx@code.org yyy@code.org facilitator_3@code.org
    })

    ActionMailer::Base.deliveries.each do |mail|
      correct_recipients << mail.to[0]
    end

    assert_equal Set.new(%w{abc@code.org xyz@code.org facilitator_1@code.org}), correct_recipients

    incorrect_recipients.each do |email|
      assert_equal false, correct_recipients.include?(email)
    end
    assert_equal [@workshop_1], Workshop.workshops_ending_today
  end

  # Only supports two teachers as an array and one facilitator as a string.
  # Creates 3 segments starting on the startDate from 9am to 10am, and then at the same time on the following two days
  def create_workshop(teachers, facilitator, start_date)
    @workshop = create(:workshop, phase: 2, cohorts: [create(:cohort,
      teachers: [create(:teacher, email: teachers[0]), create(:teacher, email: teachers[1])])],
      facilitators: [create(:facilitator, email: facilitator)])
    @workshop.segments.clear
    @workshop.segments << create(:segment, workshop_id: @workshop.id, start: start_date + 9.hour, end: DateTime.now + 10.hour)
    @workshop.segments << create(:segment, workshop_id: @workshop.id, start: start_date + 1.day + 9.hour, end: DateTime.now + 1.day + 10.hour)
    @workshop.segments << create(:segment, workshop_id: @workshop.id, start: start_date + 2.day + 9.hour, end: DateTime.now + 2.day + 10.hour)
    @workshop
  end
end
