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
  CSV_IMPORT_OPTIONS = { col_sep: "\t", headers: true }

  belongs_to :contact, class_name: 'User'

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
