# == Schema Information
#
# Table name: donor_schools
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  nces_id    :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

# A donor-school record sourced from the Pegasus CSV.
class DonorSchool < ApplicationRecord
  include Seeded

  def self.setup
    puts "in setup!"
    donor_schools = CSV.read(pegasus_dir('data/cdo-donor-schools.csv'), headers: true).map.with_index(1) do |row, id|
      {
        id: id,
        name: row['name_s'],
        nces_id: row['nces_id_s']
      }
    end
    transaction do
      reset_db
      DonorSchool.import! donor_schools
    end
  end
end
