# == Schema Information
#
# Table name: school_districts
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  city       :string(255)
#  state      :string(255)
#  zip        :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class SchoolDistrict < ActiveRecord::Base
  include Seeded

  CSV_HEADERS =
  {
    :id => 'LEAID',
    :name => 'NAME',
    :city => 'LCITY',
    :state => 'LSTATE',
    :zip => 'LZIP'
  }

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = { col_sep: "\t", headers: true, :quote_char => "\x00" }

  def self.find_or_create_all_from_tsv!(filename)
    created = []
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      created << self.first_or_create_from_tsv_row!(row)
    end
    created
  end

  def self.first_or_create_from_tsv_row!(row_data)
    params = {id: row_data[CSV_HEADERS[:id]],
              name: row_data[CSV_HEADERS[:name]],
              city: row_data[CSV_HEADERS[:city]],
              state: row_data[CSV_HEADERS[:state]],
              zip: row_data[CSV_HEADERS[:zip]]}
    SchoolDistrict.where(params).first_or_create!
  end


end
