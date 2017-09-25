# == Schema Information
#
# Table name: regional_partners
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  group      :integer
#  contact_id :integer
#  urban      :boolean
#
# Indexes
#
#  index_regional_partners_on_name_and_contact_id  (name,contact_id) UNIQUE
#

class RegionalPartner < ActiveRecord::Base
  belongs_to :contact, class_name: 'User'

  has_many :regional_partner_program_managers
  has_many :program_managers,
    class_name: 'User',
    through: :regional_partner_program_managers

  has_many :pd_workshops

  CSV_IMPORT_OPTIONS = {col_sep: "\t", headers: true}.freeze

  def self.find_or_create_all_from_tsv(filename)
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      params = {
        name: row['name'],
        group: row['group'],
      }
      RegionalPartner.where(params).first_or_create!
    end
  end
end
