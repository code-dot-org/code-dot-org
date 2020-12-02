# == Schema Information
#
# Table name: pd_workshop_daily_surveys
#
#  id             :integer          not null, primary key
#  form_id        :bigint           not null
#  submission_id  :bigint           not null
#  user_id        :integer          not null
#  pd_session_id  :integer
#  pd_workshop_id :integer          not null
#  answers        :text(65535)
#  day            :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_pd_workshop_daily_surveys_on_form_id                 (form_id)
#  index_pd_workshop_daily_surveys_on_pd_session_id           (pd_session_id)
#  index_pd_workshop_daily_surveys_on_pd_workshop_id          (pd_workshop_id)
#  index_pd_workshop_daily_surveys_on_submission_id           (submission_id) UNIQUE
#  index_pd_workshop_daily_surveys_on_user_id                 (user_id)
#  index_pd_workshop_daily_surveys_on_user_workshop_day_form  (user_id,pd_workshop_id,day,form_id) UNIQUE
#

# NOTE: This is a legacy model and no new surveys should be added here. All new surveys should use Foorm.
# This class is no longer actively synced via our JotForm cron jobs (fill_jotform_placeholders,
# sync_jotforms, process_jotform_data).

module Pd
  class WorkshopDailySurvey < ApplicationRecord
    include JotFormBackedForm
    include SharedWorkshopConstants
    include Pd::WorkshopSurveyConstants

    belongs_to :user
    belongs_to :pd_session, class_name: 'Pd::Session'
    belongs_to :pd_workshop, class_name: 'Pd::Workshop'

    validates_uniqueness_of :user_id, scope: [:pd_workshop_id, :day, :form_id],
                            message: 'already has a submission for this workshop, day, and form'
    validates_presence_of(
      :user_id,
      :pd_workshop_id,
      :day
    )
    validate :day_for_subject

    # @override
    def self.attribute_mapping
      {
        user_id: 'userId',
        pd_session_id: 'sessionId',
        pd_workshop_id: 'workshopId',
        day: 'day'
      }
    end

    # @override
    def map_answers_to_attributes
      super

      # Make sure we have a day, in case the form doesn't provide it
      set_day_from_form_id if day.nil?
    end

    def set_day_from_form_id
      self.day = self.class.get_day_for_subject_and_form_id(pd_workshop.subject, form_id)
    end

    def self.get_form_id_for_subjects_and_day(subjects, day)
      subjects.map do |subject|
        get_form_id_for_subject_and_day subject, day
      rescue
        nil
      end.compact
    end

    def self.get_form_id_for_subject_and_day(subject, day)
      # Day could be an int, or an integer as a string, or a string saying "pre/post workshop"
      get_form_id CATEGORY_MAP[subject], (day.is_a?(Integer) || day =~ /\d+/) ? "day_#{day}" : day
    end

    def self.get_day_for_subject_and_form_id(subject, form_id)
      VALID_DAYS[CATEGORY_MAP[subject]].find {|d|  get_form_id_for_subject_and_day(subject, d) == form_id}
    end

    def self.all_form_ids
      FORM_CATEGORIES.map do |category|
        VALID_DAYS[category].map do |day|
          form_name = category == CSF_CATEGORY ? CSF_SURVEY_NAMES[day] : "day_#{day}"
          get_form_id category, form_name
        end
      end.flatten.compact.uniq
    end

    def self.unique_attributes
      [:user_id, :pd_workshop_id, :day]
    end

    private

    def day_for_subject
      unless VALID_DAYS[CATEGORY_MAP[pd_workshop.subject]].include? day
        errors[:day] << "Day #{day} is not valid for workshop subject #{pd_workshop.subject}"
      end
    end
  end
end
