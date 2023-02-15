# == Schema Information
#
# Table name: census_summaries
#
#  id          :integer          not null, primary key
#  school_id   :string(12)       not null
#  school_year :integer          not null
#  teaches_cs  :string(2)
#  audit_data  :text(65535)      not null
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

  validates_presence_of :audit_data

  # High schools need to teach a 20 hour course with either
  # block- or text-based programming for it to count as CS.
  # Other schools can teach any 10 or 20 hour courses.
  # Schools that are a mix of K8 and high school use the K8 logic.
  # The teacher banner does not have the topic check boxes
  # so we count those submissions even though they don't have
  # those options checked.
  def self.submission_teaches_cs?(submission, is_high_school:, is_k8_school:)
    if is_high_school && !is_k8_school
      (
        (
          submission.how_many_20_hours_some? ||
          submission.how_many_20_hours_all?
        ) &&
        (
          submission.type == "Census::CensusTeacherBannerV1" ||
          submission.topic_text ||
          submission.topic_blocks
        )
      )
    else
      (
        submission.how_many_10_hours_some? ||
        submission.how_many_10_hours_all? ||
        submission.how_many_20_hours_some? ||
        submission.how_many_20_hours_all?
      )
    end
  end
end
