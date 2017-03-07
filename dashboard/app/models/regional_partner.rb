# == Schema Information
#
# Table name: regional_partners
#
#  id    :integer          not null, primary key
#  name  :string(255)      not null
#  group :integer
#  contact_id :integer
#

class RegionalPartner < ActiveRecord::Base
  CSV_IMPORT_OPTIONS = { col_sep: "\t", headers: true }

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
