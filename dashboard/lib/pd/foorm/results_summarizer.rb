module Pd::Foorm
  class ResultsSummarizer
    include Constants
    def self.get_results_for_workshop(workshop_id)
      return unless workshop_id

      form_submissions, forms = get_raw_data_for_workshop(workshop_id)

      parsed_forms = parse_forms(forms)
      summarized_answers = summarize_answers(form_submissions, parsed_forms)
      [parsed_forms, summarized_answers]
    end

    def self.parse_forms(forms)
      parsed_forms = {}
      forms.each do |form|
        parsed_form = {
          questions: {}
        }
        form_questions = JSON.parse(form.questions, symbolize_names: true)
        parsed_form[:title] = form_questions[:title]
        form_questions[:pages].each do |page|
          page[:elements].each do |question_data|
            # TODO: cover case of panel
            next unless QUESTION_TYPES.include?(question_data[:type])
            parsed_question = {
              title: question_data[:title],
              type: QUESTION_TO_ANSWER_TYPES[question_data[:type]]
            }
            case question_data[:type]
            when TYPE_CHECKBOX, TYPE_RADIO
              parsed_question[:choices] = question_data[:choices]
            when TYPE_RATING
              parsed_question[:choices] = get_friendly_rating_choices(question_data)
            when TYPE_MATRIX
              parsed_question[:rows] = question_data[:rows]
              parsed_question[:columns] = question_data[:columns]
            end
            parsed_form[:questions][question_data[:name]] = parsed_question
          end
        end
        parsed_forms[form.name] ||= {}
        parsed_forms[form.name][form.version] = parsed_form
      end
      parsed_forms
    end

    # probably want to combine data using parsed_form
    # data is already in a good format for combining, just need to link all the data from
    # one form
    def self.summarize_answers(foorm_submissions, parsed_forms)
      workshop_summary = {}
      foorm_submissions.each do |submission|
        next unless parsed_forms[submission.form_name] && parsed_forms[submission.form_name][submission.form_version] &&
          parsed_forms[submission.form_name][submission.form_version][:questions]
        form_questions = parsed_forms[submission.form_name][submission.form_version][:questions]
        workshop_summary[submission.form_name] ||= {}
        current_workshop_summary = workshop_summary[submission.form_name][submission.form_version] || {}
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
            current_workshop_summary[name] ||= get_zero_counters_for_options(form_questions[name][:choices])
            answer.each do |single_answer|
              current_workshop_summary[name][single_answer] += 1
            end
          when ANSWER_MATRIX
            # increment one or more counters
            current_workshop_summary[name] ||= get_matrix_zero_counters(form_questions[name][:rows], form_questions[name][:columns])
            answer.each do |row, column|
              current_workshop_summary[name][row][column] += 1
            end
          end
        end
        workshop_summary[submission.form_name][submission.form_version] = current_workshop_summary
      end
      workshop_summary
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

      [foorm_submissions, forms]
    end

    def self.get_friendly_rating_choices(question_data)
      choices = []
      min_rate = 1 || question_data[:rateMin]
      max_rate = 5 || question_data[:rateMax]
      min_rate_description = question_data[:minRateDescription] ?
                               "#{min_rate} - #{question_data[:minRateDescription]}" :
                               min_rate.to_s
      max_rate_description = question_data[:maxRateDescription] ?
                               "#{max_rate} - #{question_data[:maxRateDescription]}" :
                               max_rate.to_s
      choices << {value: min_rate.to_s, text: min_rate_description}
      (min_rate + 1...max_rate).each do |n|
        choices << {value: n.to_s, text: n.to_s}
      end
      choices << {value: max_rate.to_s, text: max_rate_description}
    end

    def self.get_matrix_zero_counters(rows, columns)
      result = {}
      rows.each do |row|
        result[row[:value]] = get_zero_counters_for_options(columns)
      end
      result
    end

    # TODO: make sure options formatted correctly
    def self.get_zero_counters_for_options(options)
      result = {}
      options.each do |choice|
        result[choice[:value].to_s] = 0
      end
      result
    end
  end
end
