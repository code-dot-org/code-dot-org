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

class Foorm::Submission < ActiveRecord::Base
  has_one :workshop_metadata, class_name: 'Pd::WorkshopSurveyFoormSubmission', foreign_key: :foorm_submission_id
  has_one :misc_survey, foreign_key: :foorm_submission_id

  belongs_to :form, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]

  # Returns a hash similar to a submission's answer, with the following changes:
  #   - flattens matrix questions
  #   - returns readable answer, instead of a key representing a user's answer.
  def formatted_answers
    question_answer_pairs = formatted_workshop_metadata

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

    # Contains human readable questions, as well as answers
    # (for non-free response questions).
    # See FoormParser for the how this is structured.
    general_parsed_questions = form.parsed_questions[:general][form.key]
    facilitator_parsed_questions = form.parsed_questions[:facilitator][form.key]

    parsed_answers.each do |question_id, answer|
      if general_parsed_questions.keys.include? question_id
        question_details = general_parsed_questions[question_id]

        case question_details[:type]
        when 'matrix'
          choices = question_details[:columns]

          answer.each do |matrix_question_id, matrix_question_answer|
            key = Foorm::Form.get_matrix_question_id(question_id, matrix_question_id)
            question_answer_pairs[key] = choices[matrix_question_answer]
          end
        when 'scale', 'text'
          question_answer_pairs[question_id] = answer
        when 'singleSelect'
          choices = question_details[:choices]
          question_answer_pairs[question_id] = choices[answer]
        when 'multiSelect'
          choices = question_details[:choices]
          question_answer_pairs[question_id] = answer.map {|selected| choices[selected]}.sort.join(', ')
        end
      elsif facilitator_parsed_questions.keys.include? question_id
        question_details = facilitator_parsed_questions[question_id]

        case question_details[:type]
        when 'matrix'
          choices = question_details[:columns]

          answer.each do |matrix_question_id, matrix_question_answer|
            key = Foorm::Form.get_matrix_question_id(question_id, matrix_question_id)
            question_answer_pairs[key] = choices[matrix_question_answer]
          end
        when 'scale', 'text'
          question_answer_pairs[question_id] = answer
        when 'singleSelect'
          choices = question_details[:choices]
          question_answer_pairs[question_id] = choices[answer]
        when 'multiSelect'
          choices = question_details[:choices]
          question_answer_pairs[question_id] = answer.map {|selected| choices[selected]}.sort.join(', ')
        end
      else
        # For any questions in the submission that aren't in the form,
        # include them in the formatted submission with as-is.
        # Main use cases are survey config variables (eg, workshop_course).
        question_answer_pairs[question_id] = answer
      end
    end

    question_answer_pairs
  end

  def formatted_workshop_metadata
    return {} if workshop_metadata.nil?

    {
      'user_id' => workshop_metadata.user&.id,
      'pd_workshop_id' => workshop_metadata.pd_workshop&.id,
      'pd_session_id' => workshop_metadata.pd_session&.id
    }
  end

  def associated_facilitator_submissions
    # Return blank array if this is a facilitator-specific response,
    # we have no workshop metadata,
    # or we have no user associated with the workshop metadata.
    return [] if workshop_metadata.facilitator_specific? || workshop_metadata&.user.nil?

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
end
