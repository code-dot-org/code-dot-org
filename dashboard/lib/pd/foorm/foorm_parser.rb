# Parses Foorm forms into a useful format for looking up questions by type (general or facilitator),
# form name, form version and question name. General questions are for the workshop overall, facilitator
# questions are asked on a per-facilitator basis
# @return
#   {
#     general: {
#       <form-name>.<form-version>: {
#         <question_name>: {
#           title: "sample title",
#           type: "text/singleSelect/multiSelect/matrix/scale",
#           # for singleSelect/multiSelect/scale
#           choices: {
#             choice_1_name: "choice 1 value",
#             ...
#           },
#           # if has other choice
#           other_text: "Other choice text",
#           # for matrix
#           rows: {
#             row_1_name: "row 1 value",
#             ...
#           },
#           columns: {
#             column_1_name: "column 1 value",
#             ...
#           }
#         }
#       }
#     },
#     facilitator: {
#       <form-name>.<form-version>: {same format as general}
#     }
#   }
module Pd::Foorm
  class FoormParser
    include Constants
    extend Helper

    # parse all forms in given list and return object in format above
    def self.parse_forms(forms)
      parsed_forms = {general: {}, facilitator: {}}
      forms.each do |form|
        parsed_form_questions = parse_form_questions(form.questions)

        parsed_forms[:general][get_form_key(form.name, form.version)] = parsed_form_questions[:general]
        unless parsed_form_questions[:facilitator].empty?
          parsed_forms[:facilitator][get_form_key(form.name, form.version)] = parsed_form_questions[:facilitator]
        end
      end

      parsed_forms
    end

    # Parse the questions of a single form, and return a readable version.
    # @param [String] form_questions Unparsed JSON string containing a Form's questions.
    # @return [Hash] Hash with two keys (:general and :facilitator), containing a readable version of the questions asked in a Form.
    def self.parse_form_questions(form_questions)
      form_questions_parsed_from_json = JSON.parse(form_questions)
      parsed_form_questions = {general: {}, facilitator: {}}

      filled_in_form_questions = ::Foorm::Form.fill_in_library_items(form_questions_parsed_from_json)
      filled_in_form_questions.deep_symbolize_keys!
      filled_in_form_questions[:pages]&.each do |page|
        page[:elements]&.each do |question_data|
          parsed_form_questions.deep_merge!(parse_element(question_data, false))
        end
      end

      parsed_form_questions
    end

    # parse a form element
    # @return hash of {general: {question_name->question_data,...}, facilitator: {...}}
    # Form element may be a panel which contains questions, therefore resulting hash
    # may contain one or more questions
    def self.parse_element(question_data, is_facilitator_question)
      parsed_questions = {general: {}, facilitator: {}}
      if PANEL_TYPES.include?(question_data[:type])
        elements = question_data[:elements]
        if question_data[:type] == TYPE_PANEL_DYNAMIC
          elements = question_data[:templateElements]
        end

        # Facilitator-specific questions are identified
        # as panels that are named "facilitators"
        if question_data[:name] == 'facilitators'
          is_facilitator_question = true
        end
        elements.each do |panel_question_data|
          parsed_questions.deep_merge!(parse_element(panel_question_data, is_facilitator_question))
        end
      else
        if QUESTION_TYPES.include?(question_data[:type])
          if is_facilitator_question
            parsed_questions[:facilitator] ||= {}
            parsed_questions[:facilitator][question_data[:name]] = parse_question(question_data)
          else
            parsed_questions[:general] ||= {}
            parsed_questions[:general][question_data[:name]] = parse_question(question_data)
          end
        end
      end
      parsed_questions
    end

    # parse single question into standardized format
    def self.parse_question(question_data)
      parsed_question = {
        title: fill_question_placeholders(question_data[:title]),
        type: QUESTION_TO_ANSWER_TYPES[question_data[:type]]
      }
      case question_data[:type]
      when TYPE_CHECKBOX, TYPE_RADIO, TYPE_DROPDOWN
        parsed_question[:choices] = flatten_choices(question_data[:choices])
        if question_data[:hasOther]
          parsed_question[:other_text] = question_data[:otherPlaceHolder] || 'other'
        end
      when TYPE_RATING
        parsed_question[:choices] = get_friendly_rating_choices(question_data)
      when TYPE_MATRIX
        parsed_question[:rows] = flatten_choices(question_data[:rows])
        parsed_question[:columns] = flatten_choices(question_data[:columns])
      end
      parsed_question
    end

    # given a rating question, create choices from
    # <min-rate>...<max-rate>, as form will only specify min and max
    # Include min/max rate descriptions in min/max choices if specified in form
    # Example choices for a rating from 1 to 5:
    # '1 - Disagree', '2', '3', '4', '5 - Agree'
    # the keys will be 1, 2, 3, 4, 5
    def self.get_friendly_rating_choices(question_data)
      choices = {}
      # survey js default min/max is 1/5
      min_rate = question_data[:rateMin] || 1
      max_rate = question_data[:rateMax] || 5
      min_rate_description = question_data[:minRateDescription] ?
                               "#{min_rate} - #{question_data[:minRateDescription]}" :
                               min_rate.to_s
      max_rate_description = question_data[:maxRateDescription] ?
                               "#{max_rate} - #{question_data[:maxRateDescription]}" :
                               max_rate.to_s
      choices[min_rate.to_s] = min_rate_description
      (min_rate + 1...max_rate).each do |n|
        choices[n.to_s] = n.to_s
      end
      choices[max_rate.to_s] = max_rate_description
      choices
    end

    # @param choices in the format [{value: "value1", text: "text1"},{value: "value2", text: "text2"},...]
    # @return object in format {value1: "text1", value2: "text2",...}
    def self.flatten_choices(choices)
      choices_obj = {}
      choices.each do |choice_hash|
        if choice_hash.class == Hash && choice_hash.key?(:value) && choice_hash.key?(:text)
          choices_obj[choice_hash[:value]] = fill_question_placeholders(choice_hash[:text])
        elsif choice_hash.class == String
          choices_obj[choice_hash] = fill_question_placeholders(choice_hash)
          Honeybadger.notify(
            "Foorm configuration contains question without key-value choice. Choice is '#{choice_hash}'. Please update the survey configuration."
          )
        end
      end
      choices_obj
    end
  end
end
