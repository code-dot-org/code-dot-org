# == Schema Information
#
# Table name: pd_workshop_survey_foorm_submissions
#
#  id                  :integer          not null, primary key
#  foorm_submission_id :integer          not null
#  user_id             :integer          not null
#  pd_session_id       :integer
#  pd_workshop_id      :integer          not null
#  day                 :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  facilitator_id      :integer
#  workshop_agenda     :string(255)
#
# Indexes
#
#  index_pd_workshop_survey_foorm_submissions_on_pd_session_id   (pd_session_id)
#  index_pd_workshop_survey_foorm_submissions_on_pd_workshop_id  (pd_workshop_id)
#  index_pd_workshop_survey_foorm_submissions_on_user_id         (user_id)
#  index_workshop_survey_foorm_submissions_on_foorm_id           (foorm_submission_id) UNIQUE
#

class Pd::WorkshopSurveyFoormSubmission < ApplicationRecord
  belongs_to :foorm_submission, class_name: 'Foorm::Submission'
  belongs_to :user
  belongs_to :pd_session, class_name: 'Pd::Session'
  belongs_to :pd_workshop, class_name: 'Pd::Workshop'

  validates_presence_of(
    :user_id,
    :pd_workshop_id
  )
  validates :pd_workshop, presence: true
  validate :day_for_workshop

  def save_with_foorm_submission(answers, form_name, form_version)
    ActiveRecord::Base.transaction do
      create_foorm_submission!(form_name: form_name, form_version: form_version, answers: answers)
      save!
    end
  end

  def self.has_submitted_form?(user_id, pd_workshop_id, pd_session_id, day, form_name)
    # Match on these values.
    submissions = Pd::WorkshopSurveyFoormSubmission.where(
      user_id: user_id,
      pd_workshop_id: pd_workshop_id,
      pd_session_id: pd_session_id,
      day: day
    )

    # If provided a form_name, narrow the search to match on that too.
    if form_name
      submissions = submissions.joins(:foorm_submission).where(foorm_submissions: {form_name: form_name})
    end

    !submissions.empty?
  end

  private

  def day_for_workshop
    if pd_workshop && !day.nil?
      session_count = pd_workshop.sessions.count
      if day > session_count
        errors[:day] << "#{day} is not valid for workshop #{pd_workshop.id}"
        Honeybadger.notify("Foorm was submitted for day #{day} for workshop #{pd_workshop.id}, which only had #{session_count} sessions.")
      end
    end
  end
end
