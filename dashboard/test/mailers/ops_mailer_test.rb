require 'test_helper'
require_relative '../../../lib/cdo/workshop_constants'

class OpsMailerTest < ActionMailer::TestCase
  include WorkshopConstants

  setup do
    Timecop.travel Time.local(2013, 9, 1, 12, 0, 0)
  end

  teardown do
    Timecop.return
  end

  test "district_contact_added_teachers" do
    cohorts_district = create(:cohorts_district)
    cohort = cohorts_district.cohort
    district = cohorts_district.district

    teachers = [create(:teacher)]

    mail = OpsMailer.district_contact_added_teachers(district.contact, cohort, teachers, [])
    assert_equal "[ops notification] #{district.contact.ops_first_name} #{district.contact.ops_last_name} modified Test Cohort", mail.subject
    assert_equal ["ops@code.org"], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert_match "added 1 teachers", mail.body.encoded
    assert links_are_complete_urls?(mail)
  end

  # see also tests in WorkshopTest

  test "workshop_in_2_weeks_reminder" do
    # Create a workshop that starts 14 days from now. Include other segments for authenticity
    workshop_1 = create_workshop(['abc@code.org', 'xyz@code.org'], 'facilitator_1@code.org', 'district_contact_1@code.org', Date.today + 14.days)

    # Create a workshop that starts 13 days from now but which includes a later segment 14 days from now to verify
    # that users are not incorrectly notified.
    create_workshop(['123@code.org', '987@code.org'], 'facilitator_2@code.org', 'district_contact_2@code.org', Date.today + 13.days)

    # Create a workshop that starts entirely after 14 days from now to verify that users are not incorrectly notified.
    create_workshop(['xxx@code.org', 'yyy@code.org'], 'facilitator_3@code.org', 'district_contact_3@code.org', Date.today + 30.days)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    actual_recipients = Set.new
    correct_recipients = Set.new(%w{abc@code.org xyz@code.org facilitator_1@code.org district_contact_1@code.org district_contact_1@code.org})
    incorrect_recipients = Set.new(
      %w{
        123@code.org
        987@code.org
        facilitator_2@code.org
        xxx@code.org
        yyy@code.org
        facilitator_3@code.org
        district_contact_2@code.org
        district_contact_3@code.org
      }
    )

    ActionMailer::Base.deliveries.each do |mail|
      actual_recipients << mail.to[0]
    end

    assert_equal correct_recipients, actual_recipients

    incorrect_recipients.each do |email|
      assert_equal false, actual_recipients.include?(email)
    end
    assert_equal [workshop_1], Workshop.in_2_weeks
  end

  test "workshop_in_3_days_reminder" do
    # Create a workshop that starts 3 days from now. Include other segments for authenticity
    workshop_1 = create_workshop(['abc@code.org', 'xyz@code.org'], 'facilitator_1@code.org', 'district_contact_1@code.org', Date.today + 3.days)

    # Create a workshop that starts 2 days from now but which includes a later segment 3 days from now to verify
    # that users are not incorrectly notified.
    create_workshop(['123@code.org', '987@code.org'], 'facilitator_2@code.org', 'district_contact_2@code.org', Date.today + 2.days)

    # Create a workshop that ends completely before 3 days from now to verify that users are not incorrectly notified.
    create_workshop(['xxx@code.org', 'yyy@code.org'], 'facilitator_3@code.org', 'district_contact_3@code.org', Date.today - 30.days)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    actual_recipients = Set.new
    correct_recipients = Set.new (%w{abc@code.org xyz@code.org facilitator_1@code.org district_contact_1@code.org})
    incorrect_recipients = Set.new(
      %w{
        123@code.org
        987@code.org
        facilitator_2@code.org
        xxx@code.org
        yyy@code.org
        facilitator_3@code.org
        district_contact_2@code.org
        district_contact_3@code.org
      }
    )

    ActionMailer::Base.deliveries.each do |mail|
      actual_recipients << mail.to[0]
    end

    assert_equal correct_recipients, actual_recipients

    incorrect_recipients.each do |email|
      assert_equal false, actual_recipients.include?(email)
    end
    assert_equal [workshop_1], Workshop.in_3_days
  end

  test "exit_survey_information" do
    # Create a workshop that ends today. Include other segments for authenticity
    workshop_1 = create_workshop(['abc@code.org', 'xyz@code.org'], 'facilitator_1@code.org', 'district_contact_1@code.org', Date.today - 2.days)

    # Create a workshop that ends tomorrow but which includes a segment today to verify that users are not incorrectly notified.
    create_workshop(['123@code.org', '987@code.org'], 'facilitator_2@code.org', 'district_contact_2@code.org', Date.today - 1.day)

    # Create a workshop that starts well after today to verify that users are not incorrectly notified.
    create_workshop(['xxx@code.org', 'yyy@code.org'], 'facilitator_3@code.org', 'district_contact_3@code.org', Date.today + 30.days)

    ActionMailer::Base.deliveries.clear
    Workshop.send_automated_emails

    actual_recipients = Set.new
    correct_recipients = Set.new(%w{abc@code.org xyz@code.org facilitator_1@code.org district_contact_1@code.org})
    incorrect_recipients = Set.new(
      %w{
        123@code.org
        987@code.org
        facilitator_2@code.org
        xxx@code.org
        yyy@code.org
        facilitator_3@code.org
        district_contact_2@code.org
        district_contact_3@code.org
      }
    )

    ActionMailer::Base.deliveries.each do |mail|
      actual_recipients << mail.to[0]
    end

    assert_equal correct_recipients, actual_recipients

    incorrect_recipients.each do |email|
      assert_equal false, actual_recipients.include?(email)
    end
    assert_equal [workshop_1], Workshop.ending_today
  end

  test 'script assigned' do
    script = build :script
    user = create :teacher
    mail = OpsMailer.script_assigned(user: user, script: script)

    assert_equal "You have been assigned a new course: #{script.localized_title}", mail.subject
    assert_equal [user.email], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert links_are_complete_urls?(mail)
  end

  test 'unexpected teacher added' do
    user = create :teacher, ops_first_name: 'Minerva', ops_last_name: 'McGonagall', email: 'minerva@hogwarts.co.uk'
    added_teachers = [(create :teacher)]
    workshop = create :workshop
    mail = OpsMailer.unexpected_teacher_added(user, added_teachers, workshop)

    assert_equal "[ops notification] #{user.email} has added unexpected teachers to #{workshop.name}", mail.subject
    assert_equal ["ops@code.org"], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert links_are_complete_urls?(mail)
  end

  test 'workshop reminder' do
    recipient = create :teacher
    workshop = create(:workshop, phase: 2)
    mail = OpsMailer.workshop_reminder(workshop, recipient)

    assert_equal "Important: Your #{workshop.phase_long_name} workshop is coming up in #{(workshop.segments.first.start.to_date - Date.today).to_i} days. Complete #{workshop.prerequisite_phase[:long_name]}", mail.subject
    assert_equal [recipient.email], mail.to
    assert_equal ["pd@code.org"], mail.from
    assert links_are_complete_urls?(mail)
  end

  test 'exit survey information email' do
    recipient = create :teacher
    workshop = create(:workshop, program_type: 1, phase: 2)
    mail = OpsMailer.exit_survey_information(workshop, recipient)

    assert_equal "Feedback requested for your Code.org PD workshop", mail.subject
    assert_equal [recipient.email], mail.to
    assert_equal ["pd@code.org"], mail.from
    assert links_are_complete_urls?(mail)
  end

  # Only supports two teachers as an array and one facilitator as a string.
  # Creates 3 segments starting on the startDate from 9am to 10am, and then at the same time on the following two days
  def create_workshop(teachers, facilitator, district_contact, start_date)
    district = create(:district, contact: create(:teacher, email: district_contact))
    cohort = create(:cohort, teachers: [create(:teacher, email: teachers[0]), create(:teacher, email: teachers[1])], districts: [district])
    workshop = create(:workshop, phase: 2, cohorts: [cohort], facilitators: [create(:facilitator, email: facilitator)])
    workshop.segments.clear
    workshop.segments << create(:segment, workshop_id: workshop.id, start: start_date + 9.hours, end: DateTime.now + 10.hours)
    workshop.segments << create(:segment, workshop_id: workshop.id, start: start_date + 1.day + 9.hours, end: DateTime.now + 1.day + 10.hours)
    workshop.segments << create(:segment, workshop_id: workshop.id, start: start_date + 2.days + 9.hours, end: DateTime.now + 2.days + 10.hours)
    workshop
  end
end
