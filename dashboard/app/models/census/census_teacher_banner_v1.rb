# == Schema Information
#
# Table name: census_submissions
#
#  id                           :integer          not null, primary key
#  type                         :string(255)      not null
#  submitter_email_address      :string(255)
#  submitter_name               :string(255)
#  submitter_role               :string(255)
#  school_year                  :integer          not null
#  how_many_do_hoc              :string(255)
#  how_many_after_school        :string(255)
#  how_many_10_hours            :string(255)
#  how_many_20_hours            :string(255)
#  other_classes_under_20_hours :boolean
#  topic_blocks                 :boolean
#  topic_text                   :boolean
#  topic_robots                 :boolean
#  topic_internet               :boolean
#  topic_security               :boolean
#  topic_data                   :boolean
#  topic_web_design             :boolean
#  topic_game_design            :boolean
#  topic_other                  :boolean
#  topic_other_description      :string(255)
#  topic_do_not_know            :boolean
#  class_frequency              :string(255)
#  tell_us_more                 :text(65535)
#  pledged                      :boolean
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  share_with_regional_partners :boolean
#
# Indexes
#
#  index_census_submissions_on_school_year_and_id  (school_year,id)
#

# This class represents census submissions coming from the teacher banner
# on code.org. That banner goes to any teacher using code.org and only
# asks either the 10 or 20 hour question (based on the teacher's school.)
# Additionally, the user is asked if those hours were in a class or in an
# after school program. Based on the answers we either record
# how_many_XX_hours or how_many_after_school
#
class Census::CensusTeacherBannerV1 < Census::CensusSubmission
  # Note: the value of submitter_role that gets validated is the key from the ROLES hash, not the value
  validates_inclusion_of :submitter_role, in: %w(teacher), message: "%{value} is not allowed"
  validate :how_many_10_20_or_afterschool

  def how_many_10_20_or_afterschool
    unless how_many_10_hours || how_many_20_hours || how_many_after_school
      errors.add(:base, "how_many_10_hours or how_many_20_hours or how_many_after_school must be provided")
    end
  end
end
