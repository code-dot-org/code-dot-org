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
        if choice_hash.instance_of?(Hash) && choice_hash.key?(:value) && choice_hash.key?(:text)
          choices_obj[choice_hash[:value]] = fill_question_placeholders(choice_hash[:text])
        elsif choice_hash.instance_of?(String)
          choices_obj[choice_hash] = fill_question_placeholders(choice_hash)
          Honeybadger.notify(
            "Foorm configuration contains question without key-value choice. Choice is '#{choice_hash}'. Please update the survey configuration."
          )
        end
      end
      choices_obj
    end

    # Parse forms preserving categories
    def self.parse_forms_preserving_categories(forms)
      parsed_forms = {general: {}, facilitator: {}}

      forms.each do |form|
        form_key = get_form_key(form.name, form.version)
        form_data = JSON.parse(form.questions)
        filled_form_data = ::Foorm::Form.fill_in_library_items(form_data)

        general_questions, facilitator_questions = parse_form_elements_with_categories(filled_form_data['pages'])

        parsed_forms[:general][form_key] = general_questions
        parsed_forms[:facilitator][form_key] = facilitator_questions unless facilitator_questions.empty?
      end

      parsed_forms
    end

    def self.parse_form_elements_with_categories(pages)
      general_questions = {}
      facilitator_questions = {}

      return [general_questions, facilitator_questions] unless pages

      pages.each do |page|
        next unless page['elements']

        page['elements'].each do |element|
          parsed_element = parse_element_with_categories(element, false)
          general_questions.merge!(parsed_element[:general])
          facilitator_questions.merge!(parsed_element[:facilitator])
        end
      end

      [general_questions, facilitator_questions]
    end

    def self.parse_element_with_categories(element, is_facilitator_context)
      result = {general: {}, facilitator: {}}
      element_type = element['type']

      # Handle panels
      if PANEL_TYPES.include?(element_type)
        is_facilitator = is_facilitator_context || element['name'] == 'facilitators'
        panel_elements = element['elements'] || element['templateElements'] || []

        panel_elements.each do |panel_element|
          parsed_panel_element = parse_element_with_categories(panel_element, is_facilitator)
          result[:general].merge!(parsed_panel_element[:general])
          result[:facilitator].merge!(parsed_panel_element[:facilitator])
        end

        return result
      end

      # Skip non-question elements
      return result unless QUESTION_TYPES.include?(element_type)

      question_name = element['name']
      parsed_question = parse_question_with_categories(element)

      if is_facilitator_context
        result[:facilitator][question_name] = parsed_question
      else
        result[:general][question_name] = parsed_question
      end

      result
    end

    def self.parse_question_with_categories(element)
      question_data = {
        name: element['name'],
        title: element['title'],
        short_text: element['shortText'],
        sub_text: element['subText'],
        type: QUESTION_TO_ANSWER_TYPES[element['type']],
        category: element['category'],
        original_type: element['type']
      }

      case element['type']
      when 'checkbox', 'radiogroup', 'dropdown'
        question_data[:choices] = flatten_choices_preserving_data(element['choices'])
        question_data[:has_other] = element['hasOther']
        question_data[:other_text] = element['otherPlaceHolder'] || 'other' if element['hasOther']
      when 'rating'
        question_data[:choices] = get_rating_choices_with_labels(element)
        question_data[:rate_min] = element['rateMin'] || DEFAULT_RATE_MIN
        question_data[:rate_max] = element['rateMax'] || DEFAULT_RATE_MAX
        question_data[:min_rate_description] = element['minRateDescription']
        question_data[:max_rate_description] = element['maxRateDescription']
      when 'matrix'
        question_data[:columns] = flatten_choices_preserving_data(element['columns'])
        question_data[:rows] = flatten_choices_preserving_data(element['rows'])

        # Preserve individual row categories for matrix questions
        question_data[:matrix_rows] = {}
        (element['rows'] || []).each do |row|
          if row.is_a?(Hash) && row['value']
            question_data[:matrix_rows][row['value']] = {
              text: row['text'],
              short_text: row['shortText'],
              sub_text: row['subText'],
              category: row['category'] || element['category']
            }
          end
        end
      end

      question_data
    end

    def self.flatten_choices_preserving_data(choices)
      return {} unless choices

      choices_obj = {}
      choices.each do |choice|
        if choice.is_a?(Hash) && choice['value']
          choices_obj[choice['value']] = choice['text'] || choice['value']
        elsif choice.is_a?(String)
          choices_obj[choice] = choice
        end
      end
      choices_obj
    end

    def self.get_rating_choices_with_labels(element)
      choices = {}
      min_rate = element['rateMin'] || DEFAULT_RATE_MIN
      max_rate = element['rateMax'] || DEFAULT_RATE_MAX

      min_description = element['minRateDescription']
      max_description = element['maxRateDescription']

      (min_rate..max_rate).each do |n|
        label = n.to_s
        if n == min_rate && min_description
          label = "#{n} - #{min_description}"
        elsif n == max_rate && max_description
          label = "#{n} - #{max_description}"
        end
        choices[n.to_s] = label
      end

      choices
    end
  end
end
