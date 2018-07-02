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

# This version of the /yourschool census form added the school autocomplete dropdown.
# There were no changes to the census questions so there is no additional logic here.
# We just use this class the get a different type in the DB for tracking purposes.
#
class Census::CensusYourSchool2017v3 < Census::CensusYourSchool2017v2
end
