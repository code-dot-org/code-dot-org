# == Schema Information
#
# Table name: pd_workshop_facilitator_daily_surveys
#
#  id             :integer          not null, primary key
#  form_id        :integer          not null
#  submission_id  :integer          not null
#  user_id        :integer          not null
#  pd_session_id  :integer
#  pd_workshop_id :integer          not null
#  facilitator_id :integer          not null
#  answers        :text(65535)
#  day            :integer          not null
#
# Indexes
#
#  index_pd_workshop_facilitator_daily_surveys_on_day             (day)
#  index_pd_workshop_facilitator_daily_surveys_on_form_id         (form_id)
#  index_pd_workshop_facilitator_daily_surveys_on_pd_session_id   (pd_session_id)
#  index_pd_workshop_facilitator_daily_surveys_on_pd_workshop_id  (pd_workshop_id)
#  index_pd_workshop_facilitator_daily_surveys_on_submission_id   (submission_id) UNIQUE
#  index_pd_workshop_facilitator_daily_surveys_on_user_id         (user_id)
#  index_pd_workshop_facilitator_daily_surveys_unique             (form_id,user_id,pd_session_id,facilitator_id) UNIQUE
#

module Pd
  class WorkshopFacilitatorDailySurvey < ActiveRecord::Base
    include JotFormBackedForm

    belongs_to :user
    belongs_to :pd_session, class_name: 'Pd::Session'
    belongs_to :pd_workshop, class_name: 'Pd::Workshop'
    belongs_to :facilitator, class_name: 'User', foreign_key: 'facilitator_id'

    validates_uniqueness_of :user_id, scope: [:pd_workshop_id, :pd_session_id, :facilitator_id, :form_id],
      message: 'already has a submission for this workshop, session, facilitator, and form'

    # @override
    def self.attribute_mapping
      {
        user_id: 'userId',
        pd_session_id: 'sessionId',
        pd_workshop_id: 'workshopId',
        facilitator_id: 'facilitatorId',
        day: 'day'
      }
    end

    validates_presence_of(
      :user_id,
      :pd_workshop_id,
      :facilitator_id,
      :day
    )

    VALID_DAYS = (1..5).freeze

    validates_inclusion_of :day, in: VALID_DAYS

    def self.form_id
      get_form_id 'local', 'facilitator'
    end

    def self.all_form_ids
      [form_id]
    end
  end
end
