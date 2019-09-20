Given(/^I am a workshop administrator with some applications of each type and status$/) do
  require_rails_env
  random_name = "TestWorkshopAdmin" + SecureRandom.hex(10)
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a workshop admin
    And I create some fake applications of each type and status
  }
end

Given(/^I am a workshop administrator$/) do
  random_name = "TestWorkshopAdmin" + SecureRandom.hex(10)
  steps %Q{
    And I create a teacher named "#{random_name}"
    And I make the teacher named "#{random_name}" a workshop admin
  }
end

Given /^I am a CSF facilitator named "([^"]*)" for regional partner "([^"]*)"$/ do |facilitator_name, partner_name|
  require_rails_env

  RegionalPartner.find_or_create_by(name: partner_name, group: 1)

  steps %Q{
    And there is a facilitator named "#{facilitator_name}" for course "#{Pd::Workshop::COURSE_CSF}"
    And I sign in as "#{facilitator_name}"
  }
end

Given /^I am a program manager named "([^"]*)" for regional partner "([^"]*)"$/ do |pm_name, partner_name|
  require_rails_env

  regional_partner = RegionalPartner.find_or_create_by(name: partner_name, group: 1)

  email, password = generate_user(pm_name)
  FactoryGirl.create(:program_manager, name: pm_name, email: email, password: password, regional_partner: regional_partner)

  steps %Q{
    And I sign in as "#{pm_name}"
  }
end

Given /^there is a facilitator named "([^"]+)" for course "([^"]+)"$/ do |name, course|
  require_rails_env

  email, password = generate_user(name)

  FactoryGirl.create(:pd_course_facilitator, course: course, facilitator:
    FactoryGirl.create(:facilitator, name: name, email: email, password: password)
  )
end

Given /^I select the "([^"]*)" facilitator at index (\d+)$/ do |name, index|
  email = @users[name][:email]
  facilitator = "#{name} (#{email})"

  steps %Q{
    And I wait until element "#facilitator#{index}" is visible
    And I select the "#{facilitator}" option in dropdown "facilitator#{index}"
  }
end

Given /^I open the new workshop form$/ do
  steps %Q{
    And I am on "http://studio.code.org/pd/workshop_dashboard"
    Then I wait until element "button:contains('New Workshop')" is visible
    Then I press "button:contains('New Workshop')" using jQuery

    And I wait until element "h2:contains('New Workshop')" is visible
  }
end

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

Given(/^I am a teacher who has just followed a workshop certificate link$/) do
  test_teacher_name = "TestTeacher - Certificate Test"
  require_rails_env

  steps %Q{
    And I create a teacher named "#{test_teacher_name}"
    And I create a workshop for course "CS Principles" attended by "#{test_teacher_name}" with 3 facilitators and end it
  }

  enrollment = Pd::Enrollment.find_by(first_name: test_teacher_name)
  steps %Q{
    And I am on "http://studio.code.org/pd/generate_workshop_certificate/#{enrollment.code}"
  }
end

Given(/^I navigate to the principal approval page for "([^"]*)"$/) do |name|
  require_rails_env

  user = User.find_by_email @users[name][:email]
  application = Pd::Application::Teacher1920Application.find_by(user: user)

  # TODO(Andrew) ensure regional partner in the original application, and remove this:
  application.update!(regional_partner: RegionalPartner.first)

  steps %Q{
    And I am on "http://studio.code.org/pd/application/principal_approval/#{application.application_guid}"
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

  user = User.find_by(email: @users[name][:email])
  user.permission = UserPermission::FACILITATOR
  Pd::CourseFacilitator.create(facilitator_id: user.id, course: course)
end

And(/^I make the teacher named "([^"]*)" a workshop organizer$/) do |name|
  require_rails_env

  user = User.find_by(email: @users[name][:email])
  user.permission = UserPermission::WORKSHOP_ORGANIZER
end

And(/^I make the teacher named "([^"]*)" a workshop admin$/) do |name|
  require_rails_env

  user = User.find_by(email: @users[name][:email])
  user.permission = UserPermission::WORKSHOP_ADMIN
end

And(/^I create some fake applications of each type and status$/) do
  require_rails_env
  time_start = Time.now

  # There's no need to create more applications if a lot already exist in the system
  if Pd::Application::Facilitator1920Application.count < 100
    %w(csf csd csp).each do |course|
      Pd::Application::ApplicationBase.statuses.each do |status|
        10.times do
          teacher = FactoryGirl.create(:teacher, school_info: SchoolInfo.first, email: "teacher_#{SecureRandom.hex}@code.org")
          application = FactoryGirl.create(:pd_facilitator1920_application, course: course, user: teacher)
          application.update(status: status)
        end
      end
    end
  end

  if Pd::Application::Teacher1920Application.count < 100
    %w(csd csp).each do |course|
      (Pd::Application::ApplicationBase.statuses - ['interview']).each do |status|
        10.times do
          teacher = FactoryGirl.create(:teacher, school_info: SchoolInfo.first, email: "teacher_#{SecureRandom.hex}@code.org")
          application_hash = FactoryGirl.build(:pd_teacher1920_application_hash, course.to_sym, school: School.first)
          application = FactoryGirl.create(:pd_teacher1920_application, form_data_hash: application_hash, course: course, user: teacher)
          application.update(status: status)
        end
      end
    end
  end
  time_end = Time.now
  puts "Creating applications took #{time_end - time_start} seconds"
end

And(/^I am viewing a workshop with fake survey results$/) do
  require_rails_env

  workshop = FactoryGirl.create :summer_workshop, :ended,
    organizer: FactoryGirl.create(:workshop_organizer, email: "test_organizer#{SecureRandom.hex}@code.org"),
    num_sessions: 5, enrolled_and_attending_users: 10,
    facilitators: [
      (FactoryGirl.create :facilitator, email: "test_facilitator#{SecureRandom.hex}@code.org", name: 'F1'),
      (FactoryGirl.create :facilitator, email: "test_facilitator#{SecureRandom.hex}@code.org", name: 'F2')
    ]
  create_fake_survey_questions workshop
  create_fake_daily_survey_results workshop

  steps %Q{
    And I am on "http://studio.code.org/pd/workshop_dashboard/daily_survey_results/#{workshop.id}"
  }
end

def create_fake_survey_questions(workshop)
  Pd::SurveyQuestion.find_or_create_by!(form_id: CDO.jotform_forms['local_summer']['day_0'],
    questions: [
      {
        id: 1,
        name: 'matrix',
        type: 'matrix',
        text: 'How much do you agree / disagree with these statements on teaching CS?',
        options: [
          'Strongly Disagree',
          'Disagree',
          'Slightly Disagree',
          'Neutral',
          'Slightly Agree',
          'Agree',
          'Strongly Agree'
        ],
        sub_questions: [
          'I like computer science',
          'People should learn computer science',
          'I feel like I can teach computer science'
        ],
        order: 1
      },
      {
        id: 2,
        name: 'scale',
        type: 'scale',
        text: 'How pumped are you to teach CS?',
        options: ['Not at all pumped', 'Super pumped'],
        values: (1..5).to_a,
        order: 2
      },
      {
        id: 3,
        name: 'radio',
        type: 'radio',
        text: 'How much CS experience do you have?',
        order: 3,
        options: [
          'None',
          'Some basic messing around',
          'Formal education',
          'I am l33t h4xx0r'
        ]
      },
      {
        id: 4,
        name: 'textarea',
        type: 'textarea',
        text: 'What inspired you to teach computer science?',
        order: 4
      },
      {
        id: 5,
        name: 'userId',
        text: 'userId',
        type: 'textarea',
        order: 5,
        hidden: true
      },
      {
        id: 6,
        name: 'workshopId',
        text: 'workshopId',
        type: 'textarea',
        order: 6,
        hidden: true
      }
    ].to_json
  )

  Pd::SurveyQuestion.find_or_create_by!(form_id: CDO.jotform_forms['local_summer']['day_1'],
    questions: [
      {
        id: 1,
        name: 'textarea',
        type: 'textarea',
        text: 'How was your day?',
        order: 1
      },
      {
        id: 2,
        name: 'userId',
        text: 'userId',
        type: 'textarea',
        order: 2,
        hidden: true
      },
      {
        id: 3,
        name: 'workshopId',
        text: 'workshopId',
        type: 'textarea',
        order: 3,
        hidden: true
      },
      {
        id: 4,
        name: 'sessionId',
        text: 'sessionId',
        type: 'textarea',
        order: 4,
        hidden: true
      }
    ].to_json
  )

  Pd::SurveyQuestion.find_or_create_by!(form_id: CDO.jotform_forms['local_summer']['facilitator'],
    questions: [
      {
        id: 1,
        name: 'textarea',
        type: 'textarea',
        text: 'How was your facilitator?',
        order: 1
      },
      {
        id: 2,
        name: 'userId',
        text: 'userId',
        type: 'textarea',
        order: 2,
        hidden: true
      },
      {
        id: 3,
        name: 'workshopId',
        text: 'workshopId',
        type: 'textarea',
        order: 3,
        hidden: true
      },
      {
        id: 4,
        name: 'sessionId',
        text: 'sessionId',
        type: 'textarea',
        order: 4,
        hidden: true
      },
      {
        id: 5,
        name: 'facilitatorId',
        text: 'facilitatorId',
        type: 'textarea',
        order: 5,
        hidden: true
      },
      {
        id: 6,
        name: 'day',
        text: 'day',
        type: 'textarea',
        order: 6,
        hidden: true
      }
    ].to_json
  )
rescue => e
  puts "Unable to create SurveyQuestions. If you are running this locally, please make
    sure that you have overridden jotform_forms in your locals.yml"
  raise e
end

def create_fake_daily_survey_results(workshop)
  10.times do |x|
    user = workshop.enrollments[x].user

    Pd::WorkshopDailySurvey.create!(
      form_id: CDO.jotform_forms['local_summer']['day_0'],
      submission_id: (Pd::WorkshopDailySurvey.maximum(:submission_id) || 0) + 1,
      pd_session: nil, #No session for the first survey
      answers: {
        '1': {
          'I like computer science': ['Strongly Agree', 'Agree', 'Slightly Agree'][x % 3],
          'People should learn computer science': ['Strongly Agree', 'Agree'][x % 2],
          'I feel like I can teach computer science': ['Strongly Agree', 'Agree', 'Disagree'][x % 3]
        },
        '2': (1..5).to_a[x % 5].to_s,
        '3': ['None', 'Some basic messing around', 'Formal education', 'I am l33t h4xx0r'][x % 4],
        '4': ['Bill Nye', 'Ada Lovelace', 'Hadi', 'Hour of Code', 'Dunno'][x % 5],
        '5': user.id,
        '6': workshop.id,
      }.to_json
    )

    Pd::WorkshopDailySurvey.create!(
      form_id: CDO.jotform_forms['local_summer']['day_1'],
      submission_id: (Pd::WorkshopDailySurvey.maximum(:submission_id) || 0) + 1,
      user: workshop.enrollments[x].user,
      pd_session: workshop.sessions.first,
      pd_workshop: workshop,
      answers: {
        '1': %w(Amazing Brilliant Great Decent)[x % 4],
        '2': user.id,
        '3': workshop.id,
        '4': workshop.sessions.first.id
      }.to_json
    )

    Pd::WorkshopFacilitatorDailySurvey.create!(
      form_id: CDO.jotform_forms['local_summer']['facilitator'],
      submission_id: (Pd::WorkshopFacilitatorDailySurvey.maximum(:submission_id) || 0) + 1,
      answers: {
        '1': %w(Helpful Hillarious Inspiring Brilliant)[x % 4],
        '2': user.id,
        '3': workshop.id,
        '4': workshop.sessions.first.id,
        '5': workshop.facilitators[x % 2].id,
        '6': 1
      }.to_json
    )
  end
end

def create_enrollment(workshop, name=nil)
  first_name = name.nil? ? "First - #{SecureRandom.hex}" : name
  last_name = name.nil? ? "Last - #{SecureRandom.hex}" : "Last"
  user = Retryable.retryable(on: [ActiveRecord::RecordInvalid], tries: 5) do
    FactoryGirl.create :teacher
  end
  enrollment = Pd::Enrollment.create!(
    first_name: first_name,
    last_name: last_name,
    email: user.email,
    school_info: SchoolInfo.find_or_create_by(
      {
        country: 'US',
        school_type: 'other',
        state: 'WA',
        zip: '98101',
        school_name: 'Code.org'
      }
    ),
    pd_workshop_id: workshop.id
  )

  PEGASUS_DB[:forms].where(kind: 'PdWorkshopSurvey', source_id: enrollment.id).delete
end

def create_facilitator(course)
  facilitator = User.find_or_create_teacher(
    {name: 'Facilitator', email: "facilitator#{SecureRandom.hex[0..5]}@code.org"}, nil, 'facilitator'
  )
  Pd::CourseFacilitator.create(facilitator_id: facilitator.id, course: course)

  facilitator
end

And(/^I create a workshop for course "([^"]*)" ([a-z]+) by "([^"]*)" with (\d+) (people|facilitators)(.*)$/) do |course, role, name, number, number_type, post_create_actions|
  # Organizer
  organizer =
    if role == 'organized'
      User.find_by(name: name)
    else
      User.find_or_create_teacher(
        {name: 'Organizer', email: "organizer#{SecureRandom.hex[0..5]}@code.org"}, nil, 'workshop_organizer'
      )
    end

  workshop = Retryable.retryable(on: [ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid], tries: 5) do
    FactoryGirl.create(:workshop, :funded,
      on_map: true,
      course: course,
      organizer_id: organizer.id,
      capacity: number.to_i,
      location_name: 'Buffalo',
      num_sessions: 1,
      sessions_from: Date.new(2018, 4, 1),
      enrolled_and_attending_users: number_type == 'people' ? number.to_i : 0
    )
  end

  # Facilitators
  if number_type == 'facilitators'
    number.to_i.times do
      workshop.facilitators << create_facilitator(course)
    end
  else
    facilitator = role == 'facilitated' ? User.find_by(name: name) : create_facilitator(course)
    workshop.facilitators << facilitator
  end

  # Attendees
  if number_type == 'people'
    number.to_i.times do
      create_enrollment(workshop)
    end
  else
    if role == 'attended'
      create_enrollment(workshop, name)
    end
  end

  if post_create_actions.include?('and end it')
    workshop.update!(started_at: DateTime.new(2016, 3, 15))
    workshop.update!(ended_at: DateTime.new(2016, 3, 15))

    if post_create_actions.include?('and answer surveys')
      responses = {'consent_b' => '1'}

      [
        Api::V1::Pd::WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
        Api::V1::Pd::WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
      ].flatten.each do |question|
        responses[question] = PdWorkshopSurvey::OPTIONS[question].last
      end

      Api::V1::Pd::WorkshopScoreSummarizer::OVERALL_SUCCESS_QUESTIONS.each do |question|
        responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.last
      end

      responses['workshop_id_i'] = workshop.id

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
  elsif post_create_actions.include?('and start it')
    workshop.update!(started_at: DateTime.new(2016, 3, 15))
  else
    workshop.update!(started_at: nil, ended_at: nil)
  end
end
