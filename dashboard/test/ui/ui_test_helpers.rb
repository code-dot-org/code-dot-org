require File.expand_path('../../../config/environment.rb', __FILE__)
require 'factory_girl'

class UiTestHelpers
  include FactoryGirl::Syntax::Methods

  def self.seed_pd_eyes_data
    # Destroy existing facilitator and organizers
    User.where(email: ['pd_test_facilitator@code.org', 'pd_test_organizer@code.org']).destroy_all

    # Make a facilitator
    facilitator = FactoryGirl.create(:facilitator, email: 'pd_test_facilitator@code.org')
    Pd::CourseFacilitator.create(facilitator_id: facilitator.id, course: Pd::Workshop::COURSE_CSP)

    # Make a workshop organizer
    organizer = FactoryGirl.create(:workshop_organizer, email: 'pd_test_organizer@code.org')

    # Create an ended workshop
    workshop = FactoryGirl.create(:pd_workshop, facilitators: [facilitator], course: Pd::Workshop::COURSE_CSP, num_sessions: 1, enrolled_and_attending_users: 5, organizer: organizer)
    workshop.facilitators << facilitator
    workshop.start!
    workshop.end!

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

    # Create a started workshop
    workshop = FactoryGirl.create(:pd_workshop, facilitators: [facilitator], course: Pd::Workshop::COURSE_CSP, num_sessions: 1, enrolled_and_attending_users: 5, organizer: organizer)
    workshop.facilitators << facilitator
    workshop.start!

    # Create an unstarted workshop
    workshop = FactoryGirl.create(:pd_workshop, facilitators: [facilitator], course: Pd::Workshop::COURSE_CSP, num_sessions: 1, enrolled_and_attending_users: 5, organizer: organizer)
    workshop.facilitators << facilitator
  end
end
