# == Schema Information
#
# Table name: pd_misc_surveys
#
#  id            :integer          not null, primary key
#  form_id       :integer          not null
#  submission_id :integer          not null
#  answers       :text(65535)
#  user_id       :integer          not null
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

    def self.all_form_ids
      [90_524_894_049_162]
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
  end
end
