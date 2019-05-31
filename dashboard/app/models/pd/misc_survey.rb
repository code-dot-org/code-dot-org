# == Schema Information
#
# Table name: pd_misc_surveys
#
#  id            :integer          not null, primary key
#  form_id       :integer          not null
#  submission_id :integer          not null
#  answers       :text(65535)
#  user_id       :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_pd_misc_surveys_on_form_id        (form_id)
#  index_pd_misc_surveys_on_submission_id  (submission_id) UNIQUE
#  index_pd_misc_surveys_on_user_id        (user_id)
#

module Pd
  class MiscSurvey < ActiveRecord::Base
    include JotFormBackedForm

    belongs_to :user

    def self.all_form_ids
      # Facilitator summit surveys, 2019.
      [
        "90525022719150", # K-5 Facilitator Pre-Survey
        "90525765349163", # K-5 Facilitator Post-Survey
        "90524894049162", # 6-12 Facilitator Pre-Survey
        "90525028928158", # 6-12 Facilitator Post-Survey
        "90525686494166", # Regional Partner Pre-Survey
        "91384165042151", # Regional Partner Post-Survey
      ].map(&:to_i)
    end

    def self.skip_submission?(processed_answers)
      # Fix for missing environment.
      false
    end

    def self.attribute_mapping
      {
        user_id: 'userId'
      }
    end

    def self.unique_attributes
      [:user_id]
    end

    def self.use_names_for_question_ids?
      true
    end
  end
end
