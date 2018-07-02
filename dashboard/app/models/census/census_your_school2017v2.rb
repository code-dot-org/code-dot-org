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
#  topic_ethical_social         :boolean
#  inaccuracy_reported          :boolean
#  inaccuracy_comment           :text(65535)
#
# Indexes
#
#  index_census_submissions_on_school_year_and_id  (school_year,id)
#

# This version of the /yourschool census form added a text field to describe what
# you meant if you selected the "other" topic. There is no check in the form to
# ensure that this value isn't an empty string.
#
class Census::CensusYourSchool2017v2 < Census::CensusYourSchool2017v1
  validates :topic_other_description, exclusion: {in: [nil], message: "cannot be nil"}, if: :require_other_description

  def show_followup?
    how_many_20_hours_some? || how_many_20_hours_all?
  end

  def require_other_description
    show_followup? && topic_other
  end
end
