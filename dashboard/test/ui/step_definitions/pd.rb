Given(/^I am a facilitator with completed courses$/) do
  random_name = "TestFacilitator" + SecureRandom.hex
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a facilitator for course "CS Fundamentals"
    And I create a workshop for course "CS Fundamentals" facilitated by "#{random_name}"
    And I enroll 5 people in the workshop facilitated by "#{random_name}" and end it
  }
end

Given(/^I am an organizer with completed courses$/) do
  random_name = "TestOrganizer" + SecureRandom.hex
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a workshop organizer
    And I create a workshop for course "CS Fundamentals" organized by "#{random_name}"
    And I enroll 5 people in the workshop organized by "#{random_name}" and end it
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

And(/^I create a workshop for course "([^"]*)" ([a-z]+) by "([^"]*)"$/) do |course, role, name|
  if role == 'organized'
    organizer = User.find_by(name: name)
    facilitator = User.find_or_create_teacher(
      {name: 'Facilitator', email: "organizer#{SecureRandom.hex}@code.org"}, nil, 'facilitator'
    )
    Pd::CourseFacilitator.create(facilitator_id: facilitator.id, course: course)
  else
    organizer = User.find_or_create_teacher(
      {name: 'Organizer', email: "organizer#{SecureRandom.hex}@code.org"}, nil, 'workshop_organizer'
    )
    facilitator = User.find_by(name: name)
  end

  workshop = Pd::Workshop.create(
    workshop_type: 'Public',
    course: course,
    organizer_id: organizer.id,
    capacity: 5
  )

  workshop.facilitators << facilitator
end

And (/^I enroll (\d+) people in the workshop ([a-z]+) by "([^"]*)" and end it$/) do |number, role, name|
  include Api::V1::Pd::WorkshopScoreSummarizer

  user = User.find_by(name: name)
  workshop = role == 'organized' ? Pd::Workshop.organized_by(user).first : Pd::Workshop.facilitated_by(user).first

  number.to_i.times do |x|
    enrollment = Pd::Enrollment.create(
      first_name: "First name - #{SecureRandom.hex}",
      last_name: "Last name - #{SecureRandom.hex}",
      email: "enrolled_teacher#{x}@foo.com",
      skip_school_validation: true,
      pd_workshop_id: workshop.id
    )
    PEGASUS_DB[:forms].where(kind: 'PdWorkshopSurvey', source_id: enrollment.id).delete
  end
  workshop.update(started_at: Time.now)
  workshop.update(ended_at: Time.now)

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
