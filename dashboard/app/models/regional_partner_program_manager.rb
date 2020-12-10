# == Schema Information
#
# Table name: regional_partner_program_managers
#
#  id                  :integer          not null, primary key
#  program_manager_id  :integer          not null
#  regional_partner_id :integer          not null
#
# Indexes
#
#  index_regional_partner_program_managers_on_program_manager_id   (program_manager_id)
#  index_regional_partner_program_managers_on_regional_partner_id  (regional_partner_id)
#

class RegionalPartnerProgramManager < ApplicationRecord
  belongs_to :program_manager, class_name: 'User'
  belongs_to :regional_partner

  has_many :pd_workshops_organized, class_name: 'Pd::Workshop', through: :program_manager

  after_create do
    program_manager.permission = UserPermission::PROGRAM_MANAGER
  end

  after_destroy do
    if program_manager.regional_partners.empty?
      program_manager.delete_permission UserPermission::PROGRAM_MANAGER
    end
  end
end
