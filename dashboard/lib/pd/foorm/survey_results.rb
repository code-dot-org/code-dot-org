

module Pd::Foorm
  class SurveyResults
    extend Helper
    include Constants

    def self.get_summary_for_workshop(workshop_id)
      return unless workshop_id

      ws_data = Pd::Workshop.find(workshop_id)
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_id)

      parsed_forms = Pd::Foorm::FoormParser.parse_forms(forms)
      summarized_answers = summarize_answers_by_survey(form_submissions, parsed_forms, ws_submissions)

      {
        course_name: ws_data.course,
        questions: parsed_forms,
        this_workshop: summarized_answers
      }
    end

    def self.get_rollup_for_workshop(workshop_id)
    end

    # TODO: once we store facilitator data
    # def self.get_rollup_for_facilitator(workshop_id, facilitator_id)
    # end

    # result format:
    # {<form_name> => { <form_version> => { num_respondents: 4,
    # <question1-name> => { num_respondents: 3, answers: {<answer1-name>: 5, <answer2-name>: 3,...}},
    # <question2-name> => {<answer1-name>: 5, <answer2-name>: 3,...},
    # <question3-name> => ['abc', 'def']
    # }}
    # Where the value for a question name is an array answers for a text question or a summary of answer choices for select/matrix
    # questions. If question is a matrix responses will be nested.
    # num_respondents/answers within the hash is used only for multi-select
    def self.summarize_answers_by_survey(foorm_submissions, parsed_forms, ws_submissions)
      workshop_summary = {}
      foorm_submissions.each do |submission|
        form_key = get_form_key(submission.form_name, submission.form_version)
        survey_key = get_survey_key(ws_submissions.where(foorm_submission_id: submission.id).first)
        next unless parsed_forms[form_key] && parsed_forms[form_key]
        form_questions = parsed_forms[form_key]
        workshop_summary[survey_key] ||= {response_count: 0}
        workshop_summary[survey_key][:response_count] += 1
        current_workshop_summary = workshop_summary[survey_key][form_key] || {}
        workshop_summary[survey_key][form_key] = add_single_submission_to_summary(submission, current_workshop_summary, form_questions)
      end
      workshop_summary
    end

    def self.add_single_submission_to_summary(submission, current_workshop_summary, form_questions)
      answers = JSON.parse(submission.answers)
      answers.each do |name, answer|
        # parse answer based on question type (which will tell us answer format)
        # add answer to summary based on question type
        next unless form_questions[name]
        question_type = form_questions[name][:type]
        case question_type
        when ANSWER_TEXT
          # add text to list of answers
          current_workshop_summary[name] ||= []
          current_workshop_summary[name] << answer
        when ANSWER_SINGLE_SELECT, ANSWER_RATING
          # increment a counter
          current_workshop_summary[name] ||= get_zero_counters_for_options(form_questions[name][:choices])
          current_workshop_summary[name][answer] += 1
        when ANSWER_MULTI_SELECT
          # increment one or more counters
          current_workshop_summary[name] ||= {num_respondents: 0}
          current_workshop_summary[name][:num_respondents] += 1
          current_workshop_summary[name][:answers] ||= get_zero_counters_for_options(form_questions[name][:choices])
          answer.each do |single_answer|
            current_workshop_summary[name][:answers][single_answer] += 1
          end
        when ANSWER_MATRIX
          # increment one or more counters
          current_workshop_summary[name] ||= get_matrix_zero_counters(form_questions[name][:rows], form_questions[name][:columns])
          answer.each do |row, column|
            current_workshop_summary[name][row][column] += 1
          end
        end
      end
      current_workshop_summary
    end

    def self.get_raw_data_for_workshop(workshop_id)
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop_id)

      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = submission_ids.empty? ? [] : ::Foorm::Submission.find(submission_ids)
      form_names_versions = foorm_submissions.pluck(:form_name, :form_version).uniq
      forms = []
      form_names_versions.each do |name, version|
        form = ::Foorm::Form.where(name: name, version: version).first
        forms << form if form
      end

      [ws_submissions, foorm_submissions, forms]
    end

    def self.get_matrix_zero_counters(rows, columns)
      result = {}
      rows.keys.each do |row_value|
        result[row_value] = get_zero_counters_for_options(columns)
      end
      result
    end

    # TODO: make sure options formatted correctly
    def self.get_zero_counters_for_options(options)
      result = {}
      options.keys.each do |choice_value|
        result[choice_value] = 0
      end
      result
    end
  end
end
