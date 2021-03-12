# == Schema Information
#
# Table name: donors
#
#  id             :integer          not null, primary key
#  name           :string(255)
#  url            :string(255)
#  show           :string(255)
#  twitter        :string(255)
#  level          :string(255)
#  weight         :float(24)
#  twitter_weight :float(24)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

# A donor record sourced from the Pegasus CSV.
class Donor < ApplicationRecord
  include Seeded

  def self.setup
    donors = CSV.read(pegasus_dir('data/cdo-donors.csv'), headers: true).map.with_index(1) do |row, id|
      {
        id: id,
        name: row['name_s'],
        url: row['url_s'],
        show: row['show_s'],
        twitter: row['twitter_s'],
        level: row['level_s'],
        weight: row['weight_f'],
        twitter_weight: row['twitter_weight_f']
      }
    end
    transaction do
      reset_db
      Donor.import! donors
    end
  end
end
