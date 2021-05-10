# == Schema Information
#
# Table name: foorm_submissions
#
#  id           :integer          not null, primary key
#  form_name    :string(255)      not null
#  form_version :integer          not null
#  answers      :text(16777215)   not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Foorm::Submission < ApplicationRecord
  include Pd::Foorm::Constants

  has_one :workshop_metadata, class_name: 'Pd::WorkshopSurveyFoormSubmission', foreign_key: :foorm_submission_id
  has_one :simple_survey_submission, foreign_key: :foorm_submission_id

  belongs_to :form, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]

  # Returns a hash similar to a submission's answer, with the following changes:
  #   - flattens matrix questions
  #   - returns readable answer, instead of a key representing a user's answer.
  def formatted_answers
    # First, grab associated PD-specific metadata for this submission (eg, workshop ID)
    formatted_answers = formatted_workshop_metadata

    # Example of what parsed_answers looks like.
    # Note that matrix questions (eg, how_much_barrier_to_teaching_cs)
    # nest answers to sub-questions.
    # {
    #   "workshop_course"=>"CS Fundamentals",
    #   "workshop_subject"=>"Deep Dive",
    #   "how_much_barrier_to_teaching_cs"=>
    #     {
    #       "time_plan_prepare"=>"1",
    #       "space_lessons_school_day"=>"2",
    #       "managing_different_courses"=>"3",
    #       "keeping_students_engaged"=>"5"
    #     },
    #   "other_barriers_fr"=>"other barriers!"
    # }
    parsed_answers = JSON.parse(answers)

    # Then, merge in formatted versions of each answer in the submission.
    parsed_answers.each do |question_name, answer|
      formatted_answers.merge! get_formatted_answer(question_name, answer)
    end

    formatted_answers
  end

  # For a given question_name-answer key-value pair from a submission's answers,
  # returns a hash with either a single key-value pair (for question types other than matrix) and a human readable response to a question,
  # or a hash with multiple values (for matrix questions) with a human readable response to each sub-question.
  # @param [String] question_name
  # @param [String] answer the stored value representing a user's answer to a question (either a key that can be paired with a human readable answer, or the answer itself)
  # @return [Hash] a human readable version of the answer(s) associated with a given question ID
  def get_formatted_answer(question_name, answer)
    question_details = form.get_question_details(question_name)

    # If question isn't in the Form, return as-is.
    # This is expected for metadata about the submission.
    return {question_name => answer} if question_details.nil?

    case question_details[:type]
    when ANSWER_MATRIX
      choices = question_details[:columns]

      pairs = {}
      answer.each do |matrix_question_id, matrix_question_answer|
        key = Foorm::Form.get_matrix_question_id(question_name, matrix_question_id)
        pairs[key] = choices[matrix_question_answer]
      end
      return pairs
    when ANSWER_RATING, ANSWER_TEXT
      return {question_name => answer}
    when ANSWER_SINGLE_SELECT
      choices = question_details[:choices]
      return {question_name => choices[answer]}
    when ANSWER_MULTI_SELECT
      choices = question_details[:choices]
      return {question_name => answer.map {|selected| choices[selected]}.compact.sort.join(', ')}
    end

    # Return blank hash if question_type not found
    return {}
  end

  def formatted_workshop_metadata
    return {} if workshop_metadata.nil? || workshop_metadata.facilitator_specific?

    {
      'created_at' => created_at,
      'user_id' => workshop_metadata.user&.id,
      'pd_workshop_id' => workshop_metadata.pd_workshop&.id,
      'pd_session_id' => workshop_metadata.pd_session&.id
    }
  end

  def associated_facilitator_submissions
    # Return blank array if this is a facilitator-specific response,
    # we have no workshop metadata,
    # or we have no user associated with the workshop metadata.
    return [] if workshop_metadata&.facilitator_specific? || workshop_metadata&.user.nil?

    associated_submission_metadatas = workshop_metadata.
      class.
      where(user: workshop_metadata.user).
      select do |associated_submission_metadata|
        associated_submission_metadata.facilitator_specific? &&
        associated_submission_metadata[:created_at].between?(
          workshop_metadata[:created_at] - 1.minute,
          workshop_metadata[:created_at] + 1.minute
        )
      end

    associated_submission_metadatas.map(&:foorm_submission)
  end

  def formatted_answers_with_facilitator_number(number)
    return {} unless workshop_metadata.facilitator_specific?

    Hash[
      formatted_answers.map do |question_id, answer_text|
        [question_id + "_#{number}", answer_text]
      end
    ]
  end
end
