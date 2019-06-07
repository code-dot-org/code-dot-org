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

    def self.all_form_data
      [
        {tag: "k5_f_pre",       form_id: "90525022719150", allow_embed: false}, # K-5 Facilitator Pre-Survey
        {tag: "k5_f_post",      form_id: "90525765349163", allow_embed: false}, # K-5 Facilitator Post-Survey
        {tag: "612_f_pre",      form_id: "90524894049162", allow_embed: false}, # 6-12 Facilitator Pre-Survey
        {tag: "612_f_post",     form_id: "90525028928158", allow_embed: false}, # 6-12 Facilitator Post-Survey
        {tag: "rp_pre",         form_id: "90525686494166", allow_embed: false}, # Regional Partner Pre-Survey
        {tag: "rp_post",        form_id: "91384165042151", allow_embed: false}, # Regional Partner Post-Survey
        {tag: "other_workshop", form_id: "91477280965166", allow_embed: true},  # Unofficial Workshop Attendance
      ]
    end

    def self.all_form_ids
      all_form_data.pluck(:form_id).map(&:to_i)
    end

    def self.find_form_data(tag)
      all_form_data.detect {|form_data| form_data[:tag] == tag}
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
