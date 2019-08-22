require 'test_helper'

class FindRelatedWorkshopTests < ActiveSupport::TestCase
  include Pd::WorkshopSurveyResultsHelper

  self.use_transactional_test_case = true

  setup_all do
    @facilitator = create :facilitator
    @organizer = create :workshop_organizer
    @program_manager = create :program_manager
    @regional_partner = @program_manager.regional_partners.first

    default_props = {
      course: Pd::Workshop::COURSE_CSD,
      subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1,
      sessions_from: Date.new(2018, 7, 1),
    }

    @first_workshop = create :workshop, :in_progress, default_props.merge(
      {
        facilitators: [@facilitator],
        regional_partner: @regional_partner,
        organizer: @organizer,
      }
    )

    @same_regional_partner = create :workshop, :in_progress, default_props.merge(
      {
        regional_partner: @regional_partner
      }
    )

    @same_organizer = create :workshop, :in_progress, default_props.merge(
      {
        organizer: @organizer
      }
    )

    @same_facilitator = create :workshop, :in_progress, default_props.merge(
      {
        facilitators: [@facilitator]
      }
    )

    # These two should never be included. Creating them to make sure of it
    create :workshop, :in_progress, default_props.merge(
      {
        sessions_from: Date.new(2018, 5, 31)
      }
    )

    create :workshop, :in_progress, default_props.merge(
      {
        course: Pd::Workshop::COURSE_CSP
      }
    )
  end

  test 'find_related_workshops finds expected workshops for workshop admins' do
    stubs(:current_user).returns(create(:workshop_admin))

    assert_equal [@first_workshop], find_related_workshops(@first_workshop).to_a
  end

  test 'find_related_workshops finds expected workshops for program managers' do
    stubs(:current_user).returns(@program_manager)

    assert_equal [@first_workshop, @same_regional_partner], find_related_workshops(@first_workshop).to_a
  end

  test 'find_related_workshops finds expected workshops for workshop organizers' do
    stubs(:current_user).returns(@organizer)

    assert_equal [@first_workshop, @same_organizer], find_related_workshops(@first_workshop).to_a
  end

  test 'find_related_workshops finds expected workshops for facilitators' do
    stubs(:current_user).returns(@facilitator)

    assert_equal [@first_workshop, @same_facilitator], find_related_workshops(@first_workshop).to_a
  end
end
