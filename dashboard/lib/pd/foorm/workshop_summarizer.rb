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
          workshop_summary[survey_key][:facilitator] ||= {response_count: {}}
          workshop_summary[survey_key][:facilitator][:response_count][ws_submission.facilitator_id] ||= 0
          workshop_summary[survey_key][:facilitator][:response_count][ws_submission.facilitator_id] += 1
          workshop_summary[survey_key][:facilitator][form_key] ||= {}
          workshop_summary[survey_key][:facilitator][form_key] = add_facilitator_submission_to_summary(
            submission,
            workshop_summary[survey_key][:facilitator][form_key],
            ws_submission.facilitator_id,
            parsed_forms[:facilitator][form_key]
          )
        end
      end
      sort_summary(workshop_summary)
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
      facilitator_id,
      form_questions
    )
      answers = JSON.parse(submission.answers)
      answers.each do |name, answer|
        next unless form_questions[name]

        current_workshop_summary[name] ||= {}
        current_workshop_summary[name][facilitator_id] = add_question_to_summary(
          current_workshop_summary[name][facilitator_id],
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

    # Sort summaries so that survey data is ordered in the order surveys
    # should be taken in. i.e. Pre-Workshop, Day 1, Day 2,.. Post-Workshop
    # @param workshop_summary: object in the format returned by summarize_answers_by_survey
    def self.sort_summary(workshop_summary)
      temp_summary = workshop_summary.sort_by {|survey_key, _| get_index_for_survey_key(survey_key)}
      workshop_summary_sorted = {}
      # temp_summary is an array in the format [[survey_key, summary],[survey_key2, summary2],...]
      # want to convert back to {survey_key: summary, survey_key2: summary2}
      temp_summary.each do |summaries|
        workshop_summary_sorted[summaries[0]] = summaries[1]
      end
      workshop_summary_sorted
    end
  end
end
