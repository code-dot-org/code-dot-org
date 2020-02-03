require 'test_helper'

class Pd::RegionalPartnerProgramManagerTest < ActiveSupport::TestCase
  test 'pd_workshops association' do
    partner_organizer = create :workshop_organizer
    regional_partner_program_manager = create :regional_partner_program_manager, program_manager: partner_organizer
    non_partner_organizer = create :workshop_organizer
    partner_workshop = create :workshop, organizer: partner_organizer
    non_partner_workshop = create :workshop, organizer: non_partner_organizer

    assert regional_partner_program_manager.pd_workshops_organized.include? partner_workshop
    refute regional_partner_program_manager.pd_workshops_organized.include? non_partner_workshop
  end

  test 'program manager permission with single partner' do
    program_manager = create :teacher
    refute program_manager.program_manager?

    regional_partner_program_manager = create :regional_partner_program_manager, program_manager: program_manager
    assert program_manager.program_manager?

    regional_partner_program_manager.destroy
    refute program_manager.program_manager?
  end

  test 'program manager permission with multiple partners' do
    program_manager = create :teacher
    refute program_manager.program_manager?

    regional_partner_program_managers = create_list :regional_partner_program_manager, 2, program_manager: program_manager
    assert program_manager.program_manager?

    regional_partner_program_managers.first.destroy
    assert program_manager.program_manager?
  end
end
