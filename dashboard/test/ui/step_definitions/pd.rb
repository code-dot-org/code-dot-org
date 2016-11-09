Given(/^I am a facilitator with completed courses$/) do
  random_name = "TestFacilitator" + SecureRandom.hex
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a facilitator for course "CS Fundamentals"
    And I create a workshop for course "CS Fundamentals" facilitated by "#{random_name}"
    And I enroll 5 people in the workshop facilitated by "#{random_name}" and end it
  }
end

And(/^I make the teacher named "([^"]*)" a facilitator for course "([^"]*)"$/) do |name, course|
  require_rails_env

  user = User.find_by(name: name)
  user.permission = UserPermission::FACILITATOR
  Pd::CourseFacilitator.create(facilitator_id: user.id, course: course)
end

And(/^I create a workshop for course "([^"]*)" facilitated by "([^"]*)"$/) do |course, name|
  organizer = User.find_or_create_teacher(
    {name: 'Organizer', email: "organizer#{SecureRandom.hex}@code.org"},
    nil,
    'workshop_organizer'
  )
  workshop = Pd::Workshop.create(
    workshop_type: 'Public',
    course: course,
    organizer_id: organizer.id,
    capacity: 5
  )

  facilitator = User.find_by(name: name)
  workshop.facilitators << facilitator
end

And (/^I enroll (\d+) people in the workshop facilitated by "([^"]*)" and end it$/) do |number, name|
  include Api::V1::Pd::WorkshopScoreSummarizer

  facilitator = User.find_by(name: name)
  workshop = Pd::Workshop.facilitated_by(facilitator).first

  number.to_i.times do |x|
    Pd::Enrollment.create(
      name: "EnrolledTeacher#{SecureRandom.hex}",
      email: "enrolled_teacher#{x}@foo.com",
      skip_school_validation: true,
      pd_workshop_id: workshop.id
    )
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
