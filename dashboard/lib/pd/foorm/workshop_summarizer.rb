# Summarizes a set of survey responses by counting number of responses or getting lists of free text
# responses
module Pd::Foorm
  class WorkshopSummarizer
    include Constants
    extend Helper

    # @return
    #   {
    #     <form_name>.<form_version> =>
    #     {
    #       num_respondents: 4,
    #       <question1-name> => { num_respondents: 3, <answer1-name>: 5, <answer2-name>: 3, other_answers: ["other 1", "other 2"]...},
    #       <question2-name> => {<answer1-name>: 5, <answer2-name>: 3,...},
    #       <question3-name> => ['abc', 'def']
    #     }
    #   }
    # Where the value for a question name is an array answers for a text question
    # or a summary of answer choices for select/matrix
    # questions. If question is a matrix responses will be nested like so:
    # {<matrix-name> => {<question1-name: {<answer1-name>: 2, <answer2-name>: 3}}}
    # num_respondents within the hash is used only for multi-select.
    # other_answers is used if the select question has a free text other field
    def self.summarize_answers_by_survey(foorm_submissions, parsed_forms, ws_submissions)
      workshop_summary = {}
      foorm_submissions.each do |submission|
        form_key = get_form_key(submission.form_name, submission.form_version)
        survey_key = get_survey_key(ws_submissions.where(foorm_submission_id: submission.id).first)
        next unless parsed_forms[form_key]
        form_questions = parsed_forms[form_key]
        workshop_summary[survey_key] ||= {response_count: 0}
        workshop_summary[survey_key][:response_count] += 1
        current_workshop_summary = workshop_summary[survey_key][form_key] || {}
        workshop_summary[survey_key][form_key] = add_single_submission_to_summary(submission, current_workshop_summary, form_questions)
      end
      workshop_summary
    end

    # Add data from a survey submission to current_workshop_summary, either by updating counts of responses
    # or adding to lists of text responses
    def self.add_single_submission_to_summary(submission, current_workshop_summary, form_questions)
      answers = JSON.parse(submission.answers)
      answers.each do |name, answer|
        # parse answer based on question type (which will tell us answer format)
        # add answer to summary based on question type
        next unless form_questions[name]
        question_type = form_questions[name][:type]

        # check if this is an 'other' response and look for other
        # text if it exists.
        if answer == 'other'
          comment_text_key = "#{name}-Comment"
          if answers[comment_text_key]
            current_workshop_summary[name]['other_answers'] ||= []
            current_workshop_summary[name]['other_answers'] << answers[comment_text_key]
            # don't add to counter when putting result in other_answers
            next
          end
        end

        case question_type
        when ANSWER_TEXT
          # add text to list of answers
          current_workshop_summary[name] ||= []
          current_workshop_summary[name] << answer
        when ANSWER_SINGLE_SELECT, ANSWER_RATING
          # increment a counter
          current_workshop_summary[name] ||= {}
          current_workshop_summary[name][answer] ||= 0
          current_workshop_summary[name][answer] += 1
        when ANSWER_MULTI_SELECT
          # increment one or more counters
          current_workshop_summary[name] ||= {}
          current_workshop_summary[name][:num_respondents] ||= 0
          current_workshop_summary[name][:num_respondents] += 1
          answer.each do |single_answer|
            current_workshop_summary[name][single_answer] ||= 0
            current_workshop_summary[name][single_answer] += 1
          end
        when ANSWER_MATRIX
          # increment one or more counters
          current_workshop_summary[name] ||= {}
          answer.each do |row, column|
            current_workshop_summary[name][row] ||= {}
            current_workshop_summary[name][row][column] ||= 0
            current_workshop_summary[name][row][column] += 1
          end
        end
      end
      current_workshop_summary
    end
  end
end
