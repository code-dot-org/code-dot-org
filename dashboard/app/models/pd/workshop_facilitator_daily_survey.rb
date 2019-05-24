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
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
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
    include Pd::WorkshopSurveyConstants

    belongs_to :user
    belongs_to :pd_session, class_name: 'Pd::Session'
    belongs_to :pd_workshop, class_name: 'Pd::Workshop'
    belongs_to :facilitator, class_name: 'User', foreign_key: 'facilitator_id'

    validates_uniqueness_of :user_id, scope: [:pd_workshop_id, :pd_session_id, :facilitator_id, :form_id],
      message: 'already has a submission for this workshop, session, facilitator, and form'

    before_validation :set_workshop_from_session, if: -> {pd_session_id_changed? && !pd_workshop_id_changed?}
    def set_workshop_from_session
      self.pd_workshop_id = pd_session&.pd_workshop_id
    end

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
      :pd_session_id,
      :facilitator_id,
      :day
    )

    # Different categories have different valid days
    # Not identical to the one in WorkshopDailySurvey
    VALID_DAYS = {
      LOCAL_CATEGORY => (1..5).to_a.freeze,
      ACADEMIC_YEAR_1_CATEGORY => [1].freeze,
      ACADEMIC_YEAR_2_CATEGORY => [1].freeze,
      ACADEMIC_YEAR_3_CATEGORY => [1].freeze,
      ACADEMIC_YEAR_4_CATEGORY => [1].freeze,
      ACADEMIC_YEAR_1_2_CATEGORY => [1, 2].freeze,
      ACADEMIC_YEAR_3_4_CATEGORY => [1, 2].freeze,
    }

    validate :day_for_subject

    def self.form_ids_for_subjects(subjects)
      subjects.map do |subject|
        form_id subject
      end
    end

    def self.form_id(subject)
      get_form_id CATEGORY_MAP[subject], FACILITATOR_FORM_KEY
    end

    def self.all_form_ids
      CATEGORY_MAP.keys.map do |subject|
        form_id(subject)
      end
    end

    def self.unique_attributes
      [:user_id, :pd_session_id, :facilitator_id]
    end

    private

    def day_for_subject
      unless VALID_DAYS[Pd::WorkshopDailySurvey::CATEGORY_MAP[pd_workshop.subject]].include? day
        errors[:day] << "Day #{day} is not valid for workshop subject #{pd_workshop.subject}"
      end
    end
  end
end
