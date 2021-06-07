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

class SchoolStatsByYear < ApplicationRecord
  self.primary_keys = :school_id, :school_year

  belongs_to :school

  # Loads/merges the data from a CSV into the table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] Optional, the CSV file parsing options.
  # @param dry_run [Boolean] Optional, roll back any db transactions after processing.
  def self.merge_from_csv(filename, options = {col_sep: "\t", headers: true, quote_char: "\x00"}, dry_run: false)
    new_schools = 0
    updated_schools = 0
    unchanged_schools = 0
    errored_schools = []

    ActiveRecord::Base.transaction do
      CSV.read(filename, options).each do |row|
        parsed = yield row
        loaded = find_by(primary_keys.map(&:to_sym).map {|k| [k, parsed[k]]}.to_h)
        if loaded.nil?
          begin
            SchoolStatsByYear.new(parsed).save!
            new_schools += 1
          rescue ActiveRecord::InvalidForeignKey
            errored_schools << parsed[:school_id]
          end
        else
          loaded.assign_attributes(parsed)
          if loaded.changed?
            loaded.update!(parsed)
            updated_schools += 1
          else
            unchanged_schools += 1
          end
        end
      end

      # Raise an error so that the db transaction rolls back
      raise "This was a dry run. No rows were modified or added. Set dry_run: false to modify db" if dry_run
    ensure
      future_tense_dry_run = dry_run ? ' to be' : ''
      summary_message = "School stats seeding: done processing #{filename}.\n"\
        "#{new_schools} new stats#{future_tense_dry_run} added.\n"\
        "#{updated_schools} stats#{future_tense_dry_run} updated.\n"\
        "#{unchanged_schools} stats#{future_tense_dry_run} unchanged.\n"\
        "#{errored_schools.length} stats failed to be added:\n"\
        "#{errored_schools.join("\n")}\n"

      CDO.log.info summary_message
    end
  end

  def has_high_school_grades?
    grade_09_offered || grade_10_offered || grade_11_offered || grade_12_offered || grade_13_offered
  end

  def has_k8_grades?
    grade_kg_offered || grade_01_offered || grade_02_offered || grade_03_offered || grade_04_offered || grade_05_offered || grade_06_offered || grade_07_offered || grade_08_offered
  end

  # Percentage of underrepresented minorities students
  # Note these are values between 0-100, not 0-1!
  def urm_percent
    percent_of_students([student_am_count, student_hi_count, student_bl_count, student_hp_count].compact.reduce(:+))
  end

  # Percentage of free/reduced lunch eligible students
  # Note these are values between 0-100, not 0-1!
  def frl_eligible_percent
    percent_of_students(frl_eligible_total)
  end

  # Is this a rural school?
  # Returns nil if there is no data. Otherwise returns true or false.
  def rural_school?
    return nil unless community_type

    # The Rural Education Achievement Program (REAP) accepts the following NCES locale codes
    # as "rural": town (distant and remote subcategories)
    # and rural (fringe, distant, and remote subcategories).
    %w(town_distant town_remote rural_fringe rural_distant rural_remote).
      include? community_type
  end

  # Title I status can be values 1-6, M, or nil.
  # Values 1-5 are Title I eligible,
  # 6 is ineligible, M=Missing, and nil are unknown.
  # See description under TITLEISTAT here:
  # https://nces.ed.gov/ccd/Data/txt/sc131alay.txt
  def title_i_eligible?
    return nil unless title_i_status
    return nil if title_i_status == 'M'

    %w(1 2 3 4 5).include? title_i_status
  end

  # returns what percent "count" is of the total student enrollment (0-100)
  def percent_of_students(count)
    return nil unless count && students_total
    (100.0 * count / students_total).round(2)
  end
end
