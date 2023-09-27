# == Schema Information
#
# Table name: census_summaries
#
#  id          :integer          not null, primary key
#  school_id   :string(12)       not null
#  school_year :integer          not null
#  teaches_cs  :string(2)
#  audit_data  :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_census_summaries_on_school_id_and_school_year  (school_id,school_year) UNIQUE
#

class Census::CensusSummary < ApplicationRecord
  belongs_to :school
  validates :school_year, presence: true, numericality: {greater_than_or_equal_to: 2015, less_than_or_equal_to: 2030}

  TEACHES = {
    YES: "Y",
    NO: "N",
    MAYBE: "M",
    HISTORICAL_YES: "HY",
    HISTORICAL_NO: "HN",
    HISTORICAL_MAYBE: "HM",
  }.freeze
  enum teaches_cs: TEACHES

  def self.summarize_census_data
    latest_year = Census::CensusSubmission.maximum(:school_year)
    school_years = (2016..latest_year)

    ActiveRecord::Base.transaction do
      School.eager_load(school_info: :census_submissions).
        eager_load(:school_stats_by_year).
        find_each do |school|
        summarize_school_data(
          {
            school: school,
            school_years: school_years,
          }
        ).each do |summary|
          if block_given?
            yield summary
          else
            summary.save!
          end
        end
      end
    end
  end
end
