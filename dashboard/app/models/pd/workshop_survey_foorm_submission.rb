# == Schema Information
#
# Table name: pd_workshop_survey_submissions
#
#  id                  :integer          not null, primary key
#  foorm_submission_id :integer          not null
#  user_id             :integer          not null
#  pd_session_id       :integer
#  pd_workshop_id      :integer          not null
#  day                 :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_workshop_survey_submissions_on_foorm_submission_id  (foorm_submission_id) UNIQUE
#  index_pd_workshop_survey_submissions_on_pd_session_id        (pd_session_id)
#  index_pd_workshop_survey_submissions_on_pd_workshop_id       (pd_workshop_id)
#  index_pd_workshop_survey_submissions_on_user_id              (user_id)
#

class Pd::WorkshopSurveyFoormSubmission < ApplicationRecord
  include Pd::WorkshopSurveyConstants

  VALID_DAYS = {
    LOCAL_CATEGORY => (0..5).to_a.freeze,
    ACADEMIC_YEAR_1_CATEGORY => [1].freeze,
    ACADEMIC_YEAR_2_CATEGORY => [1].freeze,
    ACADEMIC_YEAR_3_CATEGORY => [1].freeze,
    ACADEMIC_YEAR_4_CATEGORY => [1].freeze,
    ACADEMIC_YEAR_1_2_CATEGORY => [1, 2].freeze,
    ACADEMIC_YEAR_3_4_CATEGORY => [1, 2].freeze,
    VIRTUAL_1_CATEGORY => [1].freeze,
    VIRTUAL_2_CATEGORY => [1].freeze,
    VIRTUAL_3_CATEGORY => [1].freeze,
    VIRTUAL_4_CATEGORY => [1].freeze,
    VIRTUAL_5_CATEGORY => [1].freeze,
    VIRTUAL_6_CATEGORY => [1].freeze,
    VIRTUAL_7_CATEGORY => [1].freeze,
    VIRTUAL_8_CATEGORY => [1].freeze,
    CSF_CATEGORY => CSF_SURVEY_INDEXES.values.freeze
  }

  belongs_to :foorm_submission, class_name: 'Foorm::Submission'
  belongs_to :user
  belongs_to :pd_session, class_name: 'Pd::Session'
  belongs_to :pd_workshop, class_name: 'Pd::Workshop'

  validates_presence_of(
    :user_id,
    :pd_workshop_id
  )

  validate :day_for_subject

  private

  def day_for_subject
    unless VALID_DAYS[CATEGORY_MAP[pd_workshop.subject]].include? day
      errors[:day] << "Day #{day} is not valid for workshop subject #{pd_workshop.subject}"
    end
  end
end
