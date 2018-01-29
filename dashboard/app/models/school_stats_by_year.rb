# == Schema Information
#
# Table name: school_stats_by_years
#
#  school_id          :string(12)       not null, primary key
#  school_year        :string(9)        not null, primary key
#  grades_offered_lo  :string(2)
#  grades_offered_hi  :string(2)
#  grade_pk_offered   :boolean
#  grade_kg_offered   :boolean
#  grade_01_offered   :boolean
#  grade_02_offered   :boolean
#  grade_03_offered   :boolean
#  grade_04_offered   :boolean
#  grade_05_offered   :boolean
#  grade_06_offered   :boolean
#  grade_07_offered   :boolean
#  grade_08_offered   :boolean
#  grade_09_offered   :boolean
#  grade_10_offered   :boolean
#  grade_11_offered   :boolean
#  grade_12_offered   :boolean
#  grade_13_offered   :boolean
#  virtual_status     :string(14)
#  students_total     :integer
#  student_am_count   :integer
#  student_as_count   :integer
#  student_hi_count   :integer
#  student_bl_count   :integer
#  student_wh_count   :integer
#  student_hp_count   :integer
#  student_tr_count   :integer
#  title_i_status     :string(1)
#  frl_eligible_total :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  community_type     :string(16)
#
# Indexes
#
#  index_school_stats_by_years_on_school_id  (school_id)
#

class SchoolStatsByYear < ActiveRecord::Base
  self.primary_keys = :school_id, :school_year

  belongs_to :school

  # Mapping of urban-centric locale code to community type.
  # @see https://nces.ed.gov/programs/edge/geographicZCTA.aspx
  COMMUNITY_TYPE_MAP = {
    '11' => 'city_large',
    '12' => 'city_midsize',
    '13' => 'city_small',
    '21' => 'suburban_large',
    '22' => 'suburban_midsize',
    '23' => 'suburban_small',
    '31' => 'town_fringe',
    '32' => 'town_distant',
    '33' => 'town_remote',
    '41' => 'rural_fringe',
    '42' => 'rural_distant',
    '43' => 'rural_remote'
  }.freeze

  # Enumeration of urban-centric community types
  enum community_type: COMMUNITY_TYPE_MAP.values.index_by(&:to_sym).freeze

  # Maps the community type form the urban-centric locale code.
  # @param code [String] The urban-centric locale code.
  # @return [String] The community type.
  def self.map_community_type(code)
    return code.presence.try {|v| COMMUNITY_TYPE_MAP[v]}
  end

  # Loads/merges the data from a CSV into the table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] Optional, the CSV file parsing options.
  def self.merge_from_csv(filename, options = {col_sep: "\t", headers: true, quote_char: "\x00"})
    CSV.read(filename, options).each do |row|
      parsed = yield row
      loaded = find_by(primary_keys.map(&:to_sym).map {|k| [k, parsed[k]]}.to_h)
      if loaded.nil?
        SchoolStatsByYear.new(parsed).save!
      else
        loaded.assign_attributes(parsed)
        loaded.update!(parsed) if loaded.changed?
      end
    end
  end

  def has_high_school_grades?
    grade_09_offered || grade_10_offered || grade_11_offered || grade_12_offered || grade_13_offered
  end
end
