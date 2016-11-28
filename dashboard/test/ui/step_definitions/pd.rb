Given(/^I am a facilitator with started and completed courses$/) do
  random_name = "TestFacilitator" + SecureRandom.hex[0..9]
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a facilitator for course "CS Fundamentals"
    And I create a workshop for course "CS Fundamentals" facilitated by "#{random_name}" with 5 people and start it
    And I create a workshop for course "CS Fundamentals" facilitated by "#{random_name}" with 5 people and end it
    And I create a workshop for course "CS Fundamentals" facilitated by "#{random_name}" with 5 people
  }
end

Given(/^I am an organizer with started and completed courses$/) do
  random_name = "TestOrganizer" + SecureRandom.hex[0..9]
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a workshop organizer
    And I create a workshop for course "CS Fundamentals" organized by "#{random_name}" with 5 people and start it
    And I create a workshop for course "CS Fundamentals" organized by "#{random_name}" with 5 people and end it
    And I create a workshop for course "CS Fundamentals" organized by "#{random_name}" with 5 people
  }
end

Given(/^I am a facilitator with completed courses$/) do
  random_name = "TestFacilitator" + SecureRandom.hex[0..9]
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a facilitator for course "CS Fundamentals"
    And I create a workshop for course "CS Fundamentals" facilitated by "#{random_name}" with 5 people and end it and answer surveys
  }
end

Given(/^I am an organizer with completed courses$/) do
  random_name = "TestOrganizer" + SecureRandom.hex[0..9]
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a workshop organizer
    And I create a workshop for course "CS Fundamentals" organized by "#{random_name}" with 5 people and end it and answer surveys
  }
end

And(/^I make the teacher named "([^"]*)" a facilitator for course "([^"]*)"$/) do |name, course|
  require_rails_env

  user = User.find_by(name: name)
  user.permission = UserPermission::FACILITATOR
  Pd::CourseFacilitator.create(facilitator_id: user.id, course: course)
end

And(/^I make the teacher named "([^"]*)" a workshop organizer$/) do |name|
  require_rails_env

  user = User.find_by(name: name)
  user.permission = UserPermission::WORKSHOP_ORGANIZER
end

And(/^I create a workshop for course "([^"]*)" ([a-z]+) by "([^"]*)" with (\d+) people(.*)$/) do |course, role, name, number, post_create_actions|
  if role == 'organized'
    organizer = User.find_by(name: name)
    facilitator = User.find_or_create_teacher(
      {name: 'Facilitator', email: "organizer#{SecureRandom.hex[0..5]}@code.org"}, nil, 'facilitator'
    )
    Pd::CourseFacilitator.create(facilitator_id: facilitator.id, course: course)
  else
    organizer = User.find_or_create_teacher(
      {name: 'Organizer', email: "organizer#{SecureRandom.hex[0..5]}@code.org"}, nil, 'workshop_organizer'
    )
    facilitator = User.find_by(name: name)
  end

  workshop = Pd::Workshop.create(
    workshop_type: 'Public',
    course: course,
    organizer_id: organizer.id,
    capacity: number.to_i,
    location_name: 'Buffalo'
  )

  workshop.facilitators << facilitator

  Pd::Session.create!(
    pd_workshop_id: workshop.id,
    start: DateTime.new(2016, 3, 15) + 3.hours,
    end: DateTime.new(2016, 3, 15) + 9.hours
  )

  number.to_i.times do |x|
    enrollment = Pd::Enrollment.create(
      first_name: "First name - #{SecureRandom.hex}",
      last_name: "Last name - #{SecureRandom.hex}",
      email: "enrolled_teacher#{x}@foo.com",
      school_info: SchoolInfo.find_or_create_by({
        country: 'US',
        school_type: 'other',
        state: 'WA',
        zip: '98101',
        school_name: 'Code.org'
      }),
      pd_workshop_id: workshop.id
    )
    PEGASUS_DB[:forms].where(kind: 'PdWorkshopSurvey', source_id: enrollment.id).delete
  end

  if post_create_actions.include?('and end it')
    workshop.update!(started_at: DateTime.new(2016, 3, 15))
    workshop.update!(ended_at: DateTime.new(2016, 3, 15))

    if post_create_actions.include?('and answer surveys')
      responses = {}

      [
          Api::V1::Pd::WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
          Api::V1::Pd::WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
      ].flatten.each do |question|
        responses[question] = PdWorkshopSurvey::OPTIONS[question].last
      end

      Api::V1::Pd::WorkshopScoreSummarizer::OVERALL_SUCCESS_QUESTIONS.each do |question|
        responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.last
      end

      workshop.enrollments.each do |enrollment|
        puts "Enrollment ID - #{enrollment.id}"
        PEGASUS_DB[:forms].insert(
          secret: SecureRandom.hex,
          source_id: enrollment.id,
          kind: 'PdWorkshopSurvey',
          email: enrollment.email,
          data: responses.to_json,
          created_at: Time.now,
          created_ip: '',
          updated_at: Time.now,
          updated_ip: ''
        )
      end
    end
  elsif post_create_actions.include?('and start it')
    workshop.update!(started_at: DateTime.new(2016, 3, 15))
  else
    workshop.update!(started_at: nil, ended_at: nil)
  end
end
