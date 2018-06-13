# == Schema Information
#
# Table name: pd_workshop_daily_surveys
#
#  id             :integer          not null, primary key
#  form_id        :integer          not null
#  submission_id  :integer          not null
#  user_id        :integer          not null
#  pd_session_id  :integer
#  pd_workshop_id :integer          not null
#  answers        :text(65535)
#  day            :integer          not null
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

module Pd
  class WorkshopDailySurvey < ActiveRecord::Base
    include JotFormBackedForm

    belongs_to :user
    belongs_to :pd_session, class_name: 'Pd::Session'
    belongs_to :pd_workshop, class_name: 'Pd::Workshop'

    # @override
    def self.attribute_mapping
      {
        user_id: 'userId',
        pd_session_id: 'sessionId',
        pd_workshop_id: 'workshopId',
        day: 'day'
      }
    end

    before_validation :set_day_from_form_id, if: -> {day.nil?}
    def set_day_from_form_id
      self.day = self.class.get_day_for_form_id(form_id)
    end

    validates_uniqueness_of :user_id, scope: [:pd_workshop_id, :day, :form_id],
      message: 'already has a submission for this workshop, day, and form'

    validates_presence_of(
      :user_id,
      :pd_workshop_id,
      :day
    )

    VALID_DAYS = (0..5).freeze

    validates_inclusion_of :day, in: VALID_DAYS

    def self.get_form_id_for_day(day)
      get_form_id 'local', "day_#{day}"
    end

    def self.get_day_for_form_id(form_id)
      VALID_DAYS.find {|d|  get_form_id_for_day(d) == form_id}
    end

    def self.all_form_ids
      VALID_DAYS.map do |day|
        get_form_id_for_day day
      end
    end

    # @override
    def self.get_key_attributes(form_id, processed_answers)
      # Inspect the same fields as the uniqueness validation: user, workshop, day
      # Some responses don't have a day. In that case derive it from the form id
      {
        user_id: processed_answers['userId'],
        pd_workshop_id: processed_answers['workshopId'],
        day: processed_answers['day'] || get_day_for_form_id(form_id)
      }
    end
  end
end
