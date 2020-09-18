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
        {tag: "k5_f_pre",       form_id: "90525022719150", allow_embed: false}, # K-5 Facilitator Summit Pre-Survey
        {tag: "k5_f_post",      form_id: "90525765349163", allow_embed: false}, # K-5 Facilitator Summit Post-Survey
        {tag: "612_f_pre",      form_id: "90524894049162", allow_embed: false}, # 6-12 Facilitator Summit Pre-Survey
        {tag: "612_f_post",     form_id: "90525028928158", allow_embed: false}, # 6-12 Facilitator Summit Post-Survey
        {tag: "rp_pre",         form_id: "90525686494166", allow_embed: false}, # Facilitator summit Regional Partner Pre-Survey
        {tag: "rp_post",        form_id: "91384165042151", allow_embed: false}, # Facilitator Summit Regional Partner Post-Survey
        {tag: "fit-pre-2019",   form_id: "91826716927166", allow_embed: false}, # 2019 FiT Workshop Pre-Survey
        {tag: "fit-post-2019",  form_id: "91883754303159", allow_embed: false}, # 2019 FiT Workshop Post-Survey
        {tag: "other_workshop", form_id: "91477280965166", allow_embed: true},  # Unofficial Workshop Attendance
        {tag: "virt_k12_f_2019",    form_id: "92175282703154", allow_embed: false}, # 2019 Virtual K-12 Facilitator Survey
        {tag: "virt_ay_post_1920",  form_id: "92174983603160", allow_embed: false}, # 2019-20 Virtual Academic Year Post-Survey
        {tag: "virt_ay_m1_1920",    form_id: "92175136628158", allow_embed: false}, # 2019-20 Virtual Academic Year Survey Module 1
        {tag: "612_f_ay_post",      form_id: "91564407894165", allow_multiple_submissions: true, allow_embed: false}, # 6-12 Facilitator Academic Year post-workshop survey
        {tag: "summer_prep_post",   form_id: "201285758257160", allow_embed: true}, # Summer Prep Sessions Post Survey
        {tag: "facilitator_post",   form_id: "201595646393161", allow_multiple_submissions: true, allow_embed: true}
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
