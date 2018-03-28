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

# This class represents census submissions coming from /yourschool after
# we fixed the issue that sometimes the followup questions were not being
# shown when they should. This was also the first version of the form to
# post an explicit version number.
#
class Census::CensusYourSchool2017v4 < Census::CensusYourSchool2017v3
  def validate_pledge?
    submitter_role_teacher? || submitter_role_administrator?
  end

  # We only show the pledge checkbox based on other answers.
  # We expect some value (either true or false) in those cases only.
  validates :pledged, exclusion: {in: [nil], message: "cannot be nil"}, if: :validate_pledge?

  # These questions are shown conditionally based on other answers.
  # Only validate under those conditions.
  with_options if: :show_followup? do
    validates :topic_blocks, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_text, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_robots, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_internet, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_security, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_data, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_web_design, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_game_design, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_other, exclusion: {in: [nil], message: "cannot be nil"}
    validates :topic_do_not_know, exclusion: {in: [nil], message: "cannot be nil"}
    validates :class_frequency, presence: true
  end
end
