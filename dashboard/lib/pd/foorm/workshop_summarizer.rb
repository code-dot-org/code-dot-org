# Summarizes a set of survey responses by counting number of responses or getting lists of free text
# responses
module Pd::Foorm
  class WorkshopSummarizer
    include Constants
    extend Helper

    # @return
    #   {
    #     Day 0: {
    #       general: {
    #       <form_name>.<form_version> =>
    #         {
    #           response_count: 4,
    #           <question1-name> => { num_respondents: 3, <answer1-name>: 5, <answer2-name>: 3, other_answers: ["other 1", "other 2"]...},
    #           <question2-name> => {<answer1-name>: 5, <answer2-name>: 3,...},
    #           <question3-name> => ['abc', 'def']
    #         }
    #       },
    #       facilitator: {
    #         response_count: {facilitator1: 2, facilitator2: 2},
    #         <question4-name> => {facilitator1: {answer1: 5, answer2: 3}, facilitator2: {answer1: 4,...}}
    #       }
    #     }
    #   }
    # The answers are split by general questions and per-facilitator questions,
    # where the value for a question name is an array answers for a text question
    # or a summary of answer choices for select/matrix questions.
    # If question is a matrix responses will be nested like so:
    # {<matrix-name> => {<question1-name: {<answer1-name>: 2, <answer2-name>: 3}}}.
    # num_respondents within the hash is used only for multi-select.
    # other_answers is used if the select question has a free text other field.
    # If a question was asked on a per facilitator basis,
    # answers will be an object split per-facilitator as in question4.
    def self.summarize_answers_by_survey(foorm_submissions, parsed_forms, ws_submissions)
      workshop_summary = {}
      foorm_submissions.each do |submission|
        form_key = get_form_key(submission.form_name, submission.form_version)
        ws_submission = ws_submissions.where(foorm_submission_id: submission.id).first
        survey_key = get_survey_key(ws_submission)
        next unless parsed_forms[:general][form_key] || parsed_forms[:facilitator][form_key]
        workshop_summary[survey_key] ||= {}

        if ws_submission.facilitator_id.nil?
          workshop_summary[survey_key][:general] ||= {response_count: 0}
          workshop_summary[survey_key][:general][:response_count] += 1
          workshop_summary[survey_key][:general][form_key] ||= {}
          workshop_summary[survey_key][:general][form_key] = add_single_submission_to_summary(
            submission,
            workshop_summary[survey_key][:general][form_key],
            parsed_forms[:general][form_key]
          )
        else
          facilitator_name = User.find(ws_submission.facilitator_id).name
          workshop_summary[survey_key][:facilitator] ||= {response_count: {}}
          workshop_summary[survey_key][:facilitator][:response_count][facilitator_name] ||= 0
          workshop_summary[survey_key][:facilitator][:response_count][facilitator_name] += 1
          workshop_summary[survey_key][:facilitator][form_key] ||= {}
          workshop_summary[survey_key][:facilitator][form_key] = add_facilitator_submission_to_summary(
            submission,
            workshop_summary[survey_key][:facilitator][form_key],
            facilitator_name,
            parsed_forms[:facilitator][form_key]
          )
        end
      end
      workshop_summary
    end

    def self.get_response_count_per_survey(workshop_id, form_name, form_version)
      Pd::WorkshopSurveyFoormSubmission.
        where(pd_workshop_id: workshop_id).
        joins(:foorm_submission).
        where(foorm_submissions: {form_name: form_name, form_version: form_version}).
        select(:user_id).distinct.count
    end

    def self.add_facilitator_submission_to_summary(
      submission,
      current_workshop_summary,
      facilitator_name,
      form_questions
    )
      answers = JSON.parse(submission.answers)
      answers.each do |name, answer|
        next unless form_questions[name]

        current_workshop_summary[name] ||= {}
        current_workshop_summary[name][facilitator_name] = add_question_to_summary(
          current_workshop_summary[name][facilitator_name],
          answer,
          answers,
          form_questions[name][:type]
        )
      end
      current_workshop_summary
    end

    # Add data from a survey submission to current_workshop_summary, either by updating counts of responses
    # or adding to lists of text responses
    def self.add_single_submission_to_summary(submission, current_workshop_summary, form_questions)
      answers = JSON.parse(submission.answers)
      answers.each do |name, answer|
        # parse answer based on question type (which will tell us answer format)
        # add answer to summary based on question type
        next unless form_questions[name]

        current_workshop_summary[name] = add_question_to_summary(
          current_workshop_summary[name],
          answer,
          answers,
          form_questions[name][:type]
        )
      end
      current_workshop_summary
    end

    # adds answers to a single question to the given summary_at_question
    def self.add_question_to_summary(summary_at_question, answer, answers, question_type)
      # check if this is an 'other' response and look for other
      # text if it exists.
      if answer == 'other'
        comment_text_key = "#{name}-Comment"
        if answers[comment_text_key]
          summary_at_question['other_answers'] ||= []
          summary_at_question['other_answers'] << answers[comment_text_key]
          # don't add to counter when putting result in other_answers
          return summary_at_question
        end
      end

      case question_type
      when ANSWER_TEXT
        # add text to list of answers
        summary_at_question ||= []
        summary_at_question << answer
      when ANSWER_SINGLE_SELECT, ANSWER_RATING
        # increment a counter
        summary_at_question ||= {}
        summary_at_question[answer] ||= 0
        summary_at_question[answer] += 1
      when ANSWER_MULTI_SELECT
        # increment one or more counters
        summary_at_question ||= {}
        summary_at_question[:num_respondents] ||= 0
        summary_at_question[:num_respondents] += 1
        answer.each do |single_answer|
          summary_at_question[single_answer] ||= 0
          summary_at_question[single_answer] += 1
        end
      when ANSWER_MATRIX
        # increment one or more counters
        summary_at_question ||= {}
        answer.each do |row, column|
          summary_at_question[row] ||= {}
          summary_at_question[row][column] ||= 0
          summary_at_question[row][column] += 1
        end
      end
      summary_at_question
    end
  end
end
