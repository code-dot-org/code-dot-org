require 'test_helper'

class Pd::RegionalPartnerProgramManagerTest < ActiveSupport::TestCase
  test 'pd_workshops association' do
    partner_organizer = create :workshop_organizer
    regional_partner_program_manager = create :regional_partner_program_manager, program_manager: partner_organizer
    non_partner_organizer = create :workshop_organizer
    partner_workshop = create :pd_workshop, organizer: partner_organizer
    non_partner_workshop = create :pd_workshop, organizer: non_partner_organizer

    assert regional_partner_program_manager.pd_workshops_organized.include? partner_workshop
    refute regional_partner_program_manager.pd_workshops_organized.include? non_partner_workshop
  end
end
